/**
 * ノード検証ユーティリティ
 *
 * Symbol ノードURLの妥当性検証とヘルスチェック機能を提供
 * 関連ファイル: app/types/node.ts
 */

import type { NetworkType, NodeHealthCheck, NodeStatus } from "../types/node";

/**
 * ノードURL形式の妥当性を検証
 */
export function validateNodeUrl(url: string): {
	isValid: boolean;
	error?: string;
} {
	if (!url || typeof url !== "string") {
		return { isValid: false, error: "URLが指定されていません" };
	}

	// URLの基本構造を確認
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch {
		return { isValid: false, error: "無効なURL形式です" };
	}

	// HTTPSプロトコルの確認
	if (parsedUrl.protocol !== "https:") {
		return { isValid: false, error: "HTTPSプロトコルを使用してください" };
	}

	// ポート番号の妥当性確認（Symbol REST APIの標準ポート）
	const port = parsedUrl.port;
	if (port && !["3000", "3001"].includes(port)) {
		return {
			isValid: false,
			error: "Symbol REST APIの標準ポート（3000または3001）を使用してください",
		};
	}

	// ホスト名の妥当性確認
	if (
		!parsedUrl.hostname ||
		parsedUrl.hostname === "localhost" ||
		parsedUrl.hostname === "127.0.0.1"
	) {
		return {
			isValid: false,
			error: "ローカルホストは使用できません",
		};
	}

	return { isValid: true };
}

/**
 * ネットワーク種別の妥当性を検証
 */
export function validateNetworkType(network: string): network is NetworkType {
	return network === "TESTNET" || network === "MAINNET";
}

/**
 * ノードIDの妥当性を検証（URL+ネットワークからユニークなIDを生成）
 */
export function generateNodeId(url: string, network: NetworkType): string {
	const normalizedUrl = url.toLowerCase().replace(/\/$/, "");
	return `${network.toLowerCase()}-${btoa(normalizedUrl).replace(/[^a-zA-Z0-9]/g, "")}`;
}

/**
 * 既知のネットワーク識別子からネットワーク種別を判定
 */
export function determineNetworkFromIdentifier(networkIdentifier: number): NetworkType | null {
	// Symbol 公式ネットワーク識別子
	switch (networkIdentifier) {
		case 104: // Symbol Mainnet
			return 'MAINNET';
		case 152: // Symbol Testnet
			return 'TESTNET';
		default:
			return null; // 不明なネットワーク
	}
}

/**
 * ノードのネットワーク種別を自動検出
 */
export async function detectNodeNetwork(
	url: string,
	timeoutMs = 10000,
): Promise<{ network: NetworkType; nodeInfo: any } | { error: string }> {
	try {
		// AbortControllerでタイムアウトを実装
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		const response = await fetch(`${url}/node/info`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return {
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const nodeInfo = await response.json();

		// ネットワーク識別子からネットワーク種別を判定
		const network = determineNetworkFromIdentifier(nodeInfo.networkIdentifier);

		if (!network) {
			return {
				error: `サポートされていないネットワークです (networkIdentifier: ${nodeInfo.networkIdentifier})`,
			};
		}

		return {
			network,
			nodeInfo: {
				version: nodeInfo.version,
				publicKey: nodeInfo.publicKey,
				networkGenerationHashSeed: nodeInfo.networkGenerationHashSeed,
				networkIdentifier: nodeInfo.networkIdentifier,
				roles: nodeInfo.roles,
				port: nodeInfo.port,
				host: nodeInfo.host,
				friendlyName: nodeInfo.friendlyName,
			},
		};
	} catch (error) {
		let errorMessage = 'Unknown error';
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				errorMessage = '接続タイムアウトしました';
			} else if (error.name === 'TypeError') {
				errorMessage = 'ノードに接続できませんでした';
			} else {
				errorMessage = error.message;
			}
		}

		return { error: errorMessage };
	}
}

/**
 * ノードのヘルスチェックを実行
 */
export async function performNodeHealthCheck(
	nodeId: string,
	url: string,
	timeoutMs: number = 10000,
): Promise<NodeHealthCheck> {
	const startTime = Date.now();
	const checkedAt = new Date().toISOString();

	try {
		// AbortControllerでタイムアウトを実装
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		const response = await fetch(`${url}/node/info`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);
		const responseTime = Date.now() - startTime;

		if (!response.ok) {
			return {
				nodeId,
				checkedAt,
				status: "offline",
				responseTime,
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const nodeInfo = await response.json();

		return {
			nodeId,
			checkedAt,
			status: "online",
			responseTime,
			nodeInfo: {
				version: nodeInfo.version,
				publicKey: nodeInfo.publicKey,
				networkGenerationHashSeed: nodeInfo.networkGenerationHashSeed,
				networkIdentifier: nodeInfo.networkIdentifier,
				roles: nodeInfo.roles,
				port: nodeInfo.port,
				host: nodeInfo.host,
				friendlyName: nodeInfo.friendlyName,
			},
		};
	} catch (error) {
		const responseTime = Date.now() - startTime;

		let errorMessage = "Unknown error";
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				errorMessage = "Request timeout";
			} else if (error.name === "TypeError") {
				errorMessage = "Network error";
			} else {
				errorMessage = error.message;
			}
		}

		return {
			nodeId,
			checkedAt,
			status: "offline",
			responseTime,
			error: errorMessage,
		};
	}
}

/**
 * 複数ノードの並列ヘルスチェック
 */
export async function performBatchHealthCheck(
	nodes: Array<{ id: string; url: string }>,
	timeoutMs: number = 10000,
): Promise<NodeHealthCheck[]> {
	const healthChecks = nodes.map((node) =>
		performNodeHealthCheck(node.id, node.url, timeoutMs),
	);

	return Promise.all(healthChecks);
}

/**
 * ノードの応答時間に基づく品質評価
 */
export function evaluateNodeQuality(
	responseTime?: number,
): "excellent" | "good" | "fair" | "poor" | "unknown" {
	if (responseTime === undefined) {
		return "unknown";
	}

	if (responseTime < 100) return "excellent";
	if (responseTime < 500) return "good";
	if (responseTime < 2000) return "fair";
	return "poor";
}

/**
 * URLを正規化（末尾スラッシュ除去、小文字化）
 */
export function normalizeNodeUrl(url: string): string {
	return url.toLowerCase().replace(/\/$/, "");
}

/**
 * ノードのステータスに基づくソート順序
 */
export function getNodeStatusPriority(status: NodeStatus): number {
	switch (status) {
		case "online":
			return 0;
		case "unknown":
			return 1;
		case "offline":
			return 2;
		default:
			return 3;
	}
}

/**
 * ノードの品質に基づくソート順序
 */
export function getNodeQualityPriority(responseTime?: number): number {
	const quality = evaluateNodeQuality(responseTime);
	switch (quality) {
		case "excellent":
			return 0;
		case "good":
			return 1;
		case "fair":
			return 2;
		case "poor":
			return 3;
		case "unknown":
			return 4;
		default:
			return 5;
	}
}
