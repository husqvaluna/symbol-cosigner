/**
 * ノード管理atom（store）のテスト
 *
 * 注意: このプロジェクトにはテストフレームワークが設定されていないため、
 * 基本的なテスト構造のみを提供します。
 * 実際のテスト実行には Jest, Vitest, または Node.js の assert モジュールと
 * Jotaiのテストユーティリティが必要です。
 */

import { createStore } from "jotai";
import {
	nodesAtom,
	nodeFilterAtom,
	selectedNodeIdAtom,
	currentNetworkAtom,
	filteredNodesAtom,
	activeNodeAtom,
	nodeStatsAtom,
	availableNodesAtom,
	addNodeAtom,
	updateNodeAtom,
	removeNodeAtom,
	setActiveNodeAtom,
	switchNetworkAtom,
	setNodeFilterAtom,
	resetNodeFilterAtom,
	initializePresetNodesAtom,
} from "../store/nodes";
import type {
	Node,
	CreateNodeParams,
	UpdateNodeParams,
	NodeFilter,
} from "../types/node";

// モックテストフレームワーク（実際のテストフレームワークに置き換える）
const test = (name: string, fn: () => void) => {
	try {
		fn();
		console.log(`✓ ${name}`);
	} catch (error) {
		console.error(`✗ ${name}`, error);
	}
};

const expect = (actual: any) => ({
	toBe: (expected: any) => {
		if (actual !== expected) {
			throw new Error(`Expected ${expected}, got ${actual}`);
		}
	},
	toEqual: (expected: any) => {
		if (JSON.stringify(actual) !== JSON.stringify(expected)) {
			throw new Error(
				`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
			);
		}
	},
	toBeTruthy: () => {
		if (!actual) {
			throw new Error(`Expected truthy value, got ${actual}`);
		}
	},
	toBeFalsy: () => {
		if (actual) {
			throw new Error(`Expected falsy value, got ${actual}`);
		}
	},
	toBeGreaterThan: (expected: number) => {
		if (actual <= expected) {
			throw new Error(`Expected ${actual} to be greater than ${expected}`);
		}
	},
	toContain: (expected: any) => {
		if (!actual.includes || !actual.includes(expected)) {
			throw new Error(`Expected ${actual} to contain ${expected}`);
		}
	},
	toThrow: (fn: Function) => {
		let threw = false;
		try {
			fn();
		} catch {
			threw = true;
		}
		if (!threw) {
			throw new Error("Expected function to throw");
		}
	},
});

// テスト用のモックノード
const createMockNode = (overrides: Partial<Node> = {}): Node => ({
	id: "test-node-1",
	url: "https://test.example.com:3001",
	network: "TESTNET",
	active: false,
	memo: "テストノード",
	createdAt: "2024-01-01T00:00:00.000Z",
	status: "unknown",
	...overrides,
});

// ===== プリミティブAtomsのテスト =====

test("nodesAtom: 初期値は空配列", () => {
	const store = createStore();
	const nodes = store.get(nodesAtom);
	expect(Array.isArray(nodes)).toBe(true);
	expect(nodes.length).toBe(0);
});

test("nodeFilterAtom: 初期値は空オブジェクト", () => {
	const store = createStore();
	const filter = store.get(nodeFilterAtom);
	expect(filter).toEqual({});
});

test("selectedNodeIdAtom: 初期値はnull", () => {
	const store = createStore();
	const selectedId = store.get(selectedNodeIdAtom);
	expect(selectedId).toBe(null);
});

test("currentNetworkAtom: 初期値はTESTNET", () => {
	const store = createStore();
	const network = store.get(currentNetworkAtom);
	expect(network).toBe("TESTNET");
});

// ===== 派生Atomsのテスト =====

test("filteredNodesAtom: フィルタが適用される", () => {
	const store = createStore();
	const testNode = createMockNode({ network: "TESTNET", active: true });
	const mainnetNode = createMockNode({
		id: "mainnet-node",
		network: "MAINNET",
		active: false,
	});

	store.set(nodesAtom, [testNode, mainnetNode]);
	store.set(nodeFilterAtom, { network: "TESTNET" });

	const filtered = store.get(filteredNodesAtom);
	expect(filtered.length).toBe(1);
	expect(filtered[0].network).toBe("TESTNET");
});

test("activeNodeAtom: 現在のネットワークのアクティブノードを返す", () => {
	const store = createStore();
	const testNode = createMockNode({ network: "TESTNET", active: true });
	const mainnetNode = createMockNode({
		id: "mainnet-node",
		network: "MAINNET",
		active: true,
	});

	store.set(nodesAtom, [testNode, mainnetNode]);
	store.set(currentNetworkAtom, "TESTNET");

	const activeNode = store.get(activeNodeAtom);
	expect(activeNode?.network).toBe("TESTNET");
	expect(activeNode?.active).toBe(true);
});

test("nodeStatsAtom: 統計情報を正しく計算", () => {
	const store = createStore();
	const nodes = [
		createMockNode({ network: "TESTNET", active: true, status: "online" }),
		createMockNode({
			id: "node-2",
			network: "TESTNET",
			active: false,
			status: "offline",
		}),
		createMockNode({
			id: "node-3",
			network: "MAINNET",
			active: true,
			status: "online",
		}),
	];

	store.set(nodesAtom, nodes);

	const stats = store.get(nodeStatsAtom);
	expect(stats.total).toBe(3);
	expect(stats.active).toBe(2);
	expect(stats.online).toBe(2);
	expect(stats.offline).toBe(1);
	expect(stats.testnet).toBe(2);
	expect(stats.mainnet).toBe(1);
});

// ===== アクションAtomsのテスト =====

test("addNodeAtom: 新しいノードを追加", () => {
	const store = createStore();
	const params: CreateNodeParams = {
		url: "https://new-node.example.com:3001",
		network: "TESTNET",
		memo: "新しいノード",
		active: true,
	};

	const newNode = store.set(addNodeAtom, params);
	const nodes = store.get(nodesAtom);

	expect(nodes.length).toBe(1);
	expect(newNode.url).toBe("https://new-node.example.com:3001");
	expect(newNode.network).toBe("TESTNET");
	expect(newNode.memo).toBe("新しいノード");
	expect(newNode.active).toBe(true);
});

test("addNodeAtom: 無効なURLでエラー", () => {
	const store = createStore();
	const params: CreateNodeParams = {
		url: "http://invalid-url.com:3001", // HTTPは無効
		network: "TESTNET",
	};

	expect(() => store.set(addNodeAtom, params)).toThrow;
});

test("addNodeAtom: 重複ノードでエラー", () => {
	const store = createStore();
	const params: CreateNodeParams = {
		url: "https://duplicate.example.com:3001",
		network: "TESTNET",
	};

	// 最初の追加は成功
	store.set(addNodeAtom, params);

	// 同じノードの追加は失敗
	expect(() => store.set(addNodeAtom, params)).toThrow;
});

test("updateNodeAtom: ノード情報を更新", () => {
	const store = createStore();
	const initialNode = createMockNode();
	store.set(nodesAtom, [initialNode]);

	const updateParams: UpdateNodeParams = {
		id: initialNode.id,
		memo: "更新されたメモ",
		status: "online",
		responseTime: 123,
	};

	const updatedNode = store.set(updateNodeAtom, updateParams);
	const nodes = store.get(nodesAtom);

	expect(updatedNode.memo).toBe("更新されたメモ");
	expect(updatedNode.status).toBe("online");
	expect(updatedNode.responseTime).toBe(123);
	expect(nodes[0]).toEqual(updatedNode);
});

test("removeNodeAtom: ノードを削除", () => {
	const store = createStore();
	const nodeToRemove = createMockNode();
	const nodeToKeep = createMockNode({ id: "keep-node" });

	store.set(nodesAtom, [nodeToRemove, nodeToKeep]);
	store.set(removeNodeAtom, nodeToRemove.id);

	const nodes = store.get(nodesAtom);
	expect(nodes.length).toBe(1);
	expect(nodes[0].id).toBe("keep-node");
});

test("setActiveNodeAtom: アクティブノードを設定", () => {
	const store = createStore();
	const node1 = createMockNode({
		id: "node-1",
		network: "TESTNET",
		active: false,
	});
	const node2 = createMockNode({
		id: "node-2",
		network: "TESTNET",
		active: false,
	});

	store.set(nodesAtom, [node1, node2]);
	store.set(setActiveNodeAtom, "node-2");

	const nodes = store.get(nodesAtom);
	const activeNode = store.get(activeNodeAtom);

	expect(nodes[0].active).toBe(false);
	expect(nodes[1].active).toBe(true);
	expect(activeNode?.id).toBe("node-2");
});

test("switchNetworkAtom: ネットワークを切り替え", () => {
	const store = createStore();

	store.set(switchNetworkAtom, "MAINNET");
	const network = store.get(currentNetworkAtom);

	expect(network).toBe("MAINNET");
});

test("setNodeFilterAtom: フィルタを設定", () => {
	const store = createStore();
	const filter: NodeFilter = {
		activeOnly: true,
		network: "TESTNET",
		onlineOnly: true,
	};

	store.set(setNodeFilterAtom, filter);
	const currentFilter = store.get(nodeFilterAtom);

	expect(currentFilter).toEqual(filter);
});

test("resetNodeFilterAtom: フィルタをリセット", () => {
	const store = createStore();

	// フィルタを設定
	store.set(setNodeFilterAtom, { activeOnly: true });

	// リセット
	store.set(resetNodeFilterAtom);
	const filter = store.get(nodeFilterAtom);

	expect(filter).toEqual({});
});

// ===== プリセットノード管理のテスト =====

test("initializePresetNodesAtom: プリセットノードを初期化", () => {
	const store = createStore();

	const initializedNodes = store.set(initializePresetNodesAtom);
	const nodes = store.get(nodesAtom);

	expect(Array.isArray(initializedNodes)).toBe(true);
	expect(initializedNodes.length).toBeGreaterThan(0);
	expect(nodes.length).toBe(initializedNodes.length);
});

// テスト実行
console.log("ノード管理atom（store）のテストを開始...");
console.log(
	"注意: 実際のテスト実行にはテストフレームワーク（Jest, Vitest等）とJotaiテストユーティリティが必要です。",
);
