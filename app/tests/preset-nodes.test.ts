/**
 * プリセットノード管理ユーティリティのテスト
 *
 * 注意: このプロジェクトにはテストフレームワークが設定されていないため、
 * 基本的なテスト構造のみを提供します。
 * 実際のテスト実行には Jest, Vitest, または Node.js の assert モジュールが必要です。
 */

import type { Node } from "../types/node";
import {
  getPresetNodeStats,
  getPresetNodes,
  getPresetNodesByNetwork,
  getPresetServers,
  mergeWithPresetNodes,
  shouldInitializePresetNodes,
} from "../utils/preset-nodes";

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
    if (!actual.includes(expected)) {
      throw new Error(`Expected ${actual} to contain ${expected}`);
    }
  },
});

// ===== getPresetNodes のテスト =====

test("getPresetNodes: プリセットノード一覧を返す", () => {
  const nodes = getPresetNodes();
  expect(nodes.length).toBeGreaterThan(0);

  // 各ノードが正しい構造を持つことを確認
  const firstNode = nodes[0];
  expect(firstNode.id).toBeTruthy();
  expect(firstNode.url).toBeTruthy();
  expect(firstNode.network).toBeTruthy();
  expect(typeof firstNode.active).toBe("boolean");
  expect(firstNode.memo).toBeTruthy();
  expect(firstNode.createdAt).toBeTruthy();
  expect(firstNode.status).toBe("unknown");
});

test("getPresetNodes: TESTNETとMAINNETの両方のノードを含む", () => {
  const nodes = getPresetNodes();
  const testnetNodes = nodes.filter((n) => n.network === "TESTNET");
  const mainnetNodes = nodes.filter((n) => n.network === "MAINNET");

  expect(testnetNodes.length).toBeGreaterThan(0);
  expect(mainnetNodes.length).toBeGreaterThan(0);
});

test("getPresetNodes: 各ネットワークの最初のノードがアクティブ", () => {
  const nodes = getPresetNodes();
  const testnetNodes = nodes.filter((n) => n.network === "TESTNET");
  const mainnetNodes = nodes.filter((n) => n.network === "MAINNET");

  expect(testnetNodes[0].active).toBe(true);
  expect(mainnetNodes[0].active).toBe(true);
});

// ===== getPresetNodesByNetwork のテスト =====

test("getPresetNodesByNetwork: TESTNETノードのみを返す", () => {
  const testnetNodes = getPresetNodesByNetwork("TESTNET");

  expect(testnetNodes.length).toBeGreaterThan(0);
  testnetNodes.forEach((node) => {
    expect(node.network).toBe("TESTNET");
  });
});

test("getPresetNodesByNetwork: MAINNETノードのみを返す", () => {
  const mainnetNodes = getPresetNodesByNetwork("MAINNET");

  expect(mainnetNodes.length).toBeGreaterThan(0);
  mainnetNodes.forEach((node) => {
    expect(node.network).toBe("MAINNET");
  });
});

// ===== shouldInitializePresetNodes のテスト =====

test("shouldInitializePresetNodes: 空の配列に対してtrue", () => {
  const result = shouldInitializePresetNodes([]);
  expect(result).toBe(true);
});

test("shouldInitializePresetNodes: プリセットノードが含まれる場合false", () => {
  const presetNodes = getPresetNodes();
  const result = shouldInitializePresetNodes([presetNodes[0]]);
  expect(result).toBe(false);
});

test("shouldInitializePresetNodes: カスタムノードのみの場合true", () => {
  const customNode: Node = {
    id: "custom-testnet-node",
    url: "https://custom.example.com:3001",
    network: "TESTNET",
    active: true,
    memo: "カスタムノード",
    createdAt: new Date().toISOString(),
    status: "unknown",
  };

  const result = shouldInitializePresetNodes([customNode]);
  expect(result).toBe(true);
});

// ===== mergeWithPresetNodes のテスト =====

test("mergeWithPresetNodes: 空の配列にプリセットノードを追加", () => {
  const merged = mergeWithPresetNodes([]);
  const presetNodes = getPresetNodes();

  expect(merged.length).toBe(presetNodes.length);
});

test("mergeWithPresetNodes: 既存ノードを保持しつつプリセットを追加", () => {
  const customNode: Node = {
    id: "custom-testnet-node",
    url: "https://custom.example.com:3001",
    network: "TESTNET",
    active: true,
    memo: "カスタムノード",
    createdAt: new Date().toISOString(),
    status: "unknown",
  };

  const merged = mergeWithPresetNodes([customNode]);
  const presetNodes = getPresetNodes();

  expect(merged.length).toBe(1 + presetNodes.length);
  expect(merged[0]).toEqual(customNode);
});

test("mergeWithPresetNodes: 重複するプリセットノードを追加しない", () => {
  const presetNodes = getPresetNodes();
  const merged = mergeWithPresetNodes([presetNodes[0]]);

  expect(merged.length).toBe(presetNodes.length);
  expect(merged[0]).toEqual(presetNodes[0]);
});

// ===== getPresetServers のテスト =====

test("getPresetServers: プリセットサーバー設定を返す", () => {
  const servers = getPresetServers();

  expect(servers.TESTNET).toBeTruthy();
  expect(servers.MAINNET).toBeTruthy();
  expect(Array.isArray(servers.TESTNET)).toBe(true);
  expect(Array.isArray(servers.MAINNET)).toBe(true);
  expect(servers.TESTNET.length).toBeGreaterThan(0);
  expect(servers.MAINNET.length).toBeGreaterThan(0);
});

test("getPresetServers: HTTPSのURLのみを含む", () => {
  const servers = getPresetServers();
  const allUrls = [...servers.TESTNET, ...servers.MAINNET];

  allUrls.forEach((url) => {
    expect(url).toContain("https://");
  });
});

// ===== getPresetNodeStats のテスト =====

test("getPresetNodeStats: 統計情報を正しく計算", () => {
  const stats = getPresetNodeStats();

  expect(stats.total).toBeGreaterThan(0);
  expect(stats.testnet).toBeGreaterThan(0);
  expect(stats.mainnet).toBeGreaterThan(0);
  expect(stats.total).toBe(stats.testnet + stats.mainnet);
  expect(stats.servers).toBeTruthy();
});

test("getPresetNodeStats: サーバー設定を含む", () => {
  const stats = getPresetNodeStats();

  expect(stats.servers.TESTNET).toBeTruthy();
  expect(stats.servers.MAINNET).toBeTruthy();
  expect(Array.isArray(stats.servers.TESTNET)).toBe(true);
  expect(Array.isArray(stats.servers.MAINNET)).toBe(true);
});

// テスト実行
console.log("プリセットノード管理ユーティリティのテストを開始...");
console.log(
  "注意: 実際のテスト実行にはテストフレームワーク（Jest, Vitest等）が必要です。",
);
