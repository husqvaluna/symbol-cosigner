/**
 * ノード管理のためのJotai atoms
 *
 * 設計方針:
 * - アトミックな状態管理
 * - ローカルストレージでの永続化
 * - 型安全性の確保
 * - リアクティブな状態反映
 * - 既存のaddresses.tsパターン踏襲
 *
 * 関連ファイル:
 * - app/types/node.ts
 * - app/utils/node-validation.ts
 * - docs/preset-servers.json
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type {
	Node,
	CreateNodeParams,
	UpdateNodeParams,
	NodeFilter,
	NetworkType,
	NodeStats,
	NodeHealthCheck,
	PresetServers,
} from "../types/node";
import {
	validateNodeUrl,
	validateNetworkType,
	generateNodeId,
	normalizeNodeUrl,
	getNodeStatusPriority,
	getNodeQualityPriority,
	performNodeHealthCheck,
} from "../utils/node-validation";
import {
	getPresetNodes,
	shouldInitializePresetNodes,
	mergeWithPresetNodes,
} from "../utils/preset-nodes";

// ===== プリミティブAtoms =====

/**
 * ノード一覧の基本atom（ローカルストレージと同期）
 */
export const nodesAtom = atomWithStorage<Node[]>("symbol-cosigner-nodes", []);

/**
 * ノードフィルタリング条件のatom
 */
export const nodeFilterAtom = atom<NodeFilter>({});

/**
 * 選択中のノードIDのatom
 */
export const selectedNodeIdAtom = atom<string | null>(null);

/**
 * 現在のネットワーク設定のatom
 */
export const currentNetworkAtom = atomWithStorage<NetworkType>(
	"symbol-cosigner-current-network",
	"TESTNET",
);

// ===== 派生Atoms (Derived Atoms) =====

/**
 * フィルタリングされたノード一覧
 */
export const filteredNodesAtom = atom((get) => {
	const nodes = get(nodesAtom);
	const filter = get(nodeFilterAtom);

	return nodes.filter((node) => {
		// アクティブフィルタ
		if (filter.activeOnly && !node.active) {
			return false;
		}

		// ネットワークフィルタ
		if (filter.network && node.network !== filter.network) {
			return false;
		}

		// ステータスフィルタ
		if (filter.status && node.status !== filter.status) {
			return false;
		}

		// メモ検索
		if (
			filter.memoSearch &&
			!node.memo.toLowerCase().includes(filter.memoSearch.toLowerCase())
		) {
			return false;
		}

		// URL検索
		if (
			filter.urlSearch &&
			!node.url.toLowerCase().includes(filter.urlSearch.toLowerCase())
		) {
			return false;
		}

		// オンラインフィルタ
		if (filter.onlineOnly && node.status !== "online") {
			return false;
		}

		return true;
	});
});

/**
 * 現在アクティブなノード
 */
export const activeNodeAtom = atom((get) => {
	const nodes = get(nodesAtom);
	const currentNetwork = get(currentNetworkAtom);

	// 現在のネットワークでアクティブなノードを探す
	return (
		nodes.find((node) => node.active && node.network === currentNetwork) || null
	);
});

/**
 * ノード統計情報
 */
export const nodeStatsAtom = atom<NodeStats>((get) => {
	const nodes = get(nodesAtom);

	return {
		total: nodes.length,
		active: nodes.filter((node) => node.active).length,
		online: nodes.filter((node) => node.status === "online").length,
		offline: nodes.filter((node) => node.status === "offline").length,
		unknown: nodes.filter((node) => node.status === "unknown").length,
		testnet: nodes.filter((node) => node.network === "TESTNET").length,
		mainnet: nodes.filter((node) => node.network === "MAINNET").length,
	};
});

/**
 * 選択中のノード
 */
export const selectedNodeAtom = atom((get) => {
	const nodes = get(nodesAtom);
	const selectedId = get(selectedNodeIdAtom);

	if (!selectedId) return null;

	return nodes.find((node) => node.id === selectedId) || null;
});

/**
 * 利用可能なノード一覧（ソート済み）
 */
export const availableNodesAtom = atom((get) => {
	const nodes = get(filteredNodesAtom);
	const currentNetwork = get(currentNetworkAtom);

	// 現在のネットワークのノードのみを対象
	const networkNodes = nodes.filter((node) => node.network === currentNetwork);

	// ソート: ステータス優先、次に品質、最後に作成日時
	return networkNodes.sort((a, b) => {
		// ステータス優先度で比較
		const statusComparison =
			getNodeStatusPriority(a.status) - getNodeStatusPriority(b.status);
		if (statusComparison !== 0) return statusComparison;

		// 品質で比較
		const qualityComparison =
			getNodeQualityPriority(a.responseTime) -
			getNodeQualityPriority(b.responseTime);
		if (qualityComparison !== 0) return qualityComparison;

		// 作成日時で比較（新しい順）
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
});

// ===== アクションAtoms =====

/**
 * ノード追加atom
 */
export const addNodeAtom = atom(null, (get, set, params: CreateNodeParams) => {
	const nodes = get(nodesAtom);

	// URL検証
	const urlValidation = validateNodeUrl(params.url);
	if (!urlValidation.isValid) {
		throw new Error(urlValidation.error || "Invalid URL");
	}

	// ネットワーク検証
	if (!validateNetworkType(params.network)) {
		throw new Error("Invalid network type");
	}

	const normalizedUrl = normalizeNodeUrl(params.url);
	const nodeId = generateNodeId(normalizedUrl, params.network);

	// 重複チェック
	if (nodes.some((node) => node.id === nodeId)) {
		throw new Error("このノードは既に登録されています");
	}

	const newNode: Node = {
		id: nodeId,
		url: normalizedUrl,
		network: params.network,
		active: params.active ?? false,
		memo: params.memo ?? "",
		createdAt: new Date().toISOString(),
		status: "unknown",
	};

	set(nodesAtom, [...nodes, newNode]);
	return newNode;
});

/**
 * ノード更新atom
 */
export const updateNodeAtom = atom(
	null,
	(get, set, params: UpdateNodeParams) => {
		const nodes = get(nodesAtom);
		const nodeIndex = nodes.findIndex((node) => node.id === params.id);

		if (nodeIndex === -1) {
			throw new Error("ノードが見つかりません");
		}

		// URL更新の場合は検証
		if (params.url !== undefined) {
			const urlValidation = validateNodeUrl(params.url);
			if (!urlValidation.isValid) {
				throw new Error(urlValidation.error || "Invalid URL");
			}
		}

		// ネットワーク更新の場合は検証
		if (params.network !== undefined && !validateNetworkType(params.network)) {
			throw new Error("Invalid network type");
		}

		const updatedNode: Node = {
			...nodes[nodeIndex],
			...params,
			url: params.url ? normalizeNodeUrl(params.url) : nodes[nodeIndex].url,
		};

		const updatedNodes = [...nodes];
		updatedNodes[nodeIndex] = updatedNode;

		set(nodesAtom, updatedNodes);
		return updatedNode;
	},
);

/**
 * ノード削除atom
 */
export const removeNodeAtom = atom(null, (get, set, nodeId: string) => {
	const nodes = get(nodesAtom);
	const filteredNodes = nodes.filter((node) => node.id !== nodeId);

	if (filteredNodes.length === nodes.length) {
		throw new Error("ノードが見つかりません");
	}

	set(nodesAtom, filteredNodes);

	// 削除されたノードが選択中だった場合はクリア
	const selectedId = get(selectedNodeIdAtom);
	if (selectedId === nodeId) {
		set(selectedNodeIdAtom, null);
	}
});

/**
 * アクティブノード設定atom
 */
export const setActiveNodeAtom = atom(null, (get, set, nodeId: string) => {
	const nodes = get(nodesAtom);
	const targetNode = nodes.find((node) => node.id === nodeId);

	if (!targetNode) {
		throw new Error("ノードが見つかりません");
	}

	const updatedNodes = nodes.map((node) => ({
		...node,
		active:
			node.id === nodeId
				? true
				: node.network === targetNode.network
					? false
					: node.active,
		lastUsedAt: node.id === nodeId ? new Date().toISOString() : node.lastUsedAt,
	}));

	set(nodesAtom, updatedNodes);
	set(currentNetworkAtom, targetNode.network);
});

/**
 * ネットワーク切り替えatom
 */
export const switchNetworkAtom = atom(
	null,
	(get, set, network: NetworkType) => {
		if (!validateNetworkType(network)) {
			throw new Error("Invalid network type");
		}

		set(currentNetworkAtom, network);

		// 新しいネットワークでアクティブなノードがない場合、利用可能な最初のノードをアクティブにする
		const nodes = get(nodesAtom);
		const activeNodeInNetwork = nodes.find(
			(node) => node.network === network && node.active,
		);

		if (!activeNodeInNetwork) {
			const availableNode = nodes.find(
				(node) => node.network === network && node.status === "online",
			);
			if (availableNode) {
				set(setActiveNodeAtom, availableNode.id);
			}
		}
	},
);

/**
 * ノードフィルタ設定atom
 */
export const setNodeFilterAtom = atom(null, (get, set, filter: NodeFilter) => {
	set(nodeFilterAtom, filter);
});

/**
 * ノードフィルタリセットatom
 */
export const resetNodeFilterAtom = atom(null, (get, set) => {
	set(nodeFilterAtom, {});
});

/**
 * ノードヘルスチェック実行atom
 */
export const performNodeHealthCheckAtom = atom(
	null,
	async (get, set, nodeId: string) => {
		const nodes = get(nodesAtom);
		const node = nodes.find((n) => n.id === nodeId);

		if (!node) {
			throw new Error("ノードが見つかりません");
		}

		try {
			const healthCheck = await performNodeHealthCheck(nodeId, node.url);

			// ヘルスチェック結果でノード情報を更新
			const updateParams: UpdateNodeParams = {
				id: nodeId,
				status: healthCheck.status,
				responseTime: healthCheck.responseTime,
				lastCheckedAt: healthCheck.checkedAt,
				lastError: healthCheck.error,
			};

			// ノード情報が取得できた場合は更新
			if (healthCheck.nodeInfo) {
				Object.assign(updateParams, healthCheck.nodeInfo);
			}

			set(updateNodeAtom, updateParams);
			return healthCheck;
		} catch (error) {
			// エラーが発生した場合はオフライン状態に更新
			set(updateNodeAtom, {
				id: nodeId,
				status: "offline",
				lastCheckedAt: new Date().toISOString(),
				lastError: error instanceof Error ? error.message : "Unknown error",
			});

			throw error;
		}
	},
);

/**
 * 全ノードヘルスチェック実行atom
 */
export const performAllHealthChecksAtom = atom(null, async (get, set) => {
	const nodes = get(nodesAtom);
	const healthCheckPromises = nodes.map((node) =>
		performNodeHealthCheck(node.id, node.url).catch((error) => ({
			nodeId: node.id,
			checkedAt: new Date().toISOString(),
			status: "offline" as const,
			responseTime: undefined,
			error: error instanceof Error ? error.message : "Unknown error",
			nodeInfo: undefined,
		})),
	);

	const results = await Promise.all(healthCheckPromises);

	// 全結果でノード状態を一括更新
	const updatedNodes = nodes.map((node) => {
		const result = results.find((r) => r.nodeId === node.id);
		if (!result) return node;

		return {
			...node,
			status: result.status,
			responseTime: result.responseTime,
			lastCheckedAt: result.checkedAt,
			lastError: result.error,
			...(result.nodeInfo || {}),
		};
	});

	set(nodesAtom, updatedNodes);
	return results;
});

// ===== プリセットノード管理Atoms =====

/**
 * プリセットノード初期化atom
 */
export const initializePresetNodesAtom = atom(null, (get, set) => {
	const existingNodes = get(nodesAtom);

	if (shouldInitializePresetNodes(existingNodes)) {
		const presetNodes = getPresetNodes();
		set(nodesAtom, presetNodes);

		// デフォルトでTESTNETの最初のノードをアクティブに設定
		const testnetActiveNode = presetNodes.find(
			(node) => node.network === "TESTNET" && node.active,
		);

		if (testnetActiveNode) {
			set(currentNetworkAtom, "TESTNET");
		}

		return presetNodes;
	}

	return existingNodes;
});

/**
 * プリセットノードマージatom
 */
export const mergePresetNodesAtom = atom(null, (get, set) => {
	const existingNodes = get(nodesAtom);
	const mergedNodes = mergeWithPresetNodes(existingNodes);

	if (mergedNodes.length > existingNodes.length) {
		set(nodesAtom, mergedNodes);
		return mergedNodes.slice(existingNodes.length); // 新規追加されたノードのみ返す
	}

	return [];
});

/**
 * プリセットノード一覧取得atom（読み取り専用）
 */
export const presetNodesAtom = atom(() => getPresetNodes());
