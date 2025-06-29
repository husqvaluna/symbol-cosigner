/**
 * ノード検証ユーティリティのテスト
 *
 * 注意: このプロジェクトにはテストフレームワークが設定されていないため、
 * 基本的なテスト構造のみを提供します。
 * 実際のテスト実行には Jest, Vitest, または Node.js の assert モジュールが必要です。
 */

import {
	validateNodeUrl,
	validateNetworkType,
	generateNodeId,
	normalizeNodeUrl,
	evaluateNodeQuality,
	getNodeStatusPriority,
	getNodeQualityPriority,
} from "../utils/node-validation";

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
});

// ===== validateNodeUrl のテスト =====

test("validateNodeUrl: 有効なHTTPS URLを受け入れる", () => {
	const result = validateNodeUrl("https://sym-test-01.opening-line.jp:3001");
	expect(result.isValid).toBe(true);
	expect(result.error).toBe(undefined);
});

test("validateNodeUrl: 無効なHTTP URLを拒否する", () => {
	const result = validateNodeUrl("http://example.com:3001");
	expect(result.isValid).toBe(false);
	expect(result.error).toBe("HTTPSプロトコルを使用してください");
});

test("validateNodeUrl: 無効なポート番号を拒否する", () => {
	const result = validateNodeUrl("https://example.com:8080");
	expect(result.isValid).toBe(false);
	expect(result.error).toBe(
		"Symbol REST APIの標準ポート（3000または3001）を使用してください",
	);
});

test("validateNodeUrl: ローカルホストを拒否する", () => {
	const result = validateNodeUrl("https://localhost:3001");
	expect(result.isValid).toBe(false);
	expect(result.error).toBe("ローカルホストは使用できません");
});

test("validateNodeUrl: 空文字列を拒否する", () => {
	const result = validateNodeUrl("");
	expect(result.isValid).toBe(false);
	expect(result.error).toBe("URLが指定されていません");
});

test("validateNodeUrl: 無効なURL形式を拒否する", () => {
	const result = validateNodeUrl("not-a-url");
	expect(result.isValid).toBe(false);
	expect(result.error).toBe("無効なURL形式です");
});

// ===== validateNetworkType のテスト =====

test("validateNetworkType: TESTNETを受け入れる", () => {
	const result = validateNetworkType("TESTNET");
	expect(result).toBe(true);
});

test("validateNetworkType: MAINNETを受け入れる", () => {
	const result = validateNetworkType("MAINNET");
	expect(result).toBe(true);
});

test("validateNetworkType: 無効なネットワークタイプを拒否する", () => {
	const result = validateNetworkType("INVALID");
	expect(result).toBe(false);
});

test("validateNetworkType: 小文字を拒否する", () => {
	const result = validateNetworkType("testnet");
	expect(result).toBe(false);
});

// ===== generateNodeId のテスト =====

test("generateNodeId: 一意のIDを生成する", () => {
	const id1 = generateNodeId("https://example.com:3001", "TESTNET");
	const id2 = generateNodeId("https://example.com:3001", "MAINNET");

	expect(id1).toBeTruthy();
	expect(id2).toBeTruthy();
	expect(id1 !== id2).toBeTruthy();
});

test("generateNodeId: 同じ入力に対して同じIDを生成する", () => {
	const id1 = generateNodeId("https://example.com:3001", "TESTNET");
	const id2 = generateNodeId("https://example.com:3001", "TESTNET");

	expect(id1).toBe(id2);
});

// ===== normalizeNodeUrl のテスト =====

test("normalizeNodeUrl: 末尾スラッシュを除去する", () => {
	const result = normalizeNodeUrl("https://example.com:3001/");
	expect(result).toBe("https://example.com:3001");
});

test("normalizeNodeUrl: 大文字を小文字に変換する", () => {
	const result = normalizeNodeUrl("HTTPS://EXAMPLE.COM:3001");
	expect(result).toBe("https://example.com:3001");
});

test("normalizeNodeUrl: 複数の末尾スラッシュを処理する", () => {
	const result = normalizeNodeUrl("https://example.com:3001///");
	expect(result).toBe("https://example.com:3001");
});

// ===== evaluateNodeQuality のテスト =====

test("evaluateNodeQuality: 高速レスポンス（<100ms）をexcellentと評価", () => {
	const result = evaluateNodeQuality(50);
	expect(result).toBe("excellent");
});

test("evaluateNodeQuality: 中速レスポンス（100-500ms）をgoodと評価", () => {
	const result = evaluateNodeQuality(300);
	expect(result).toBe("good");
});

test("evaluateNodeQuality: 低速レスポンス（500-2000ms）をfairと評価", () => {
	const result = evaluateNodeQuality(1000);
	expect(result).toBe("fair");
});

test("evaluateNodeQuality: 非常に低速レスポンス（>2000ms）をpoorと評価", () => {
	const result = evaluateNodeQuality(3000);
	expect(result).toBe("poor");
});

test("evaluateNodeQuality: undefinedをunknownと評価", () => {
	const result = evaluateNodeQuality(undefined);
	expect(result).toBe("unknown");
});

// ===== getNodeStatusPriority のテスト =====

test("getNodeStatusPriority: オンラインノードが最優先（0）", () => {
	const result = getNodeStatusPriority("online");
	expect(result).toBe(0);
});

test("getNodeStatusPriority: 不明ノードが2番目（1）", () => {
	const result = getNodeStatusPriority("unknown");
	expect(result).toBe(1);
});

test("getNodeStatusPriority: オフラインノードが最下位（2）", () => {
	const result = getNodeStatusPriority("offline");
	expect(result).toBe(2);
});

// ===== getNodeQualityPriority のテスト =====

test("getNodeQualityPriority: 優秀な品質が最優先（0）", () => {
	const result = getNodeQualityPriority(50);
	expect(result).toBe(0);
});

test("getNodeQualityPriority: 良好な品質が2番目（1）", () => {
	const result = getNodeQualityPriority(300);
	expect(result).toBe(1);
});

test("getNodeQualityPriority: 不明な品質が最下位（4）", () => {
	const result = getNodeQualityPriority(undefined);
	expect(result).toBe(4);
});

// テスト実行
console.log("ノード検証ユーティリティのテストを開始...");
console.log(
	"注意: 実際のテスト実行にはテストフレームワーク（Jest, Vitest等）が必要です。",
);
