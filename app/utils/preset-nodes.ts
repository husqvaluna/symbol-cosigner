/**
 * プリセットノード管理ユーティリティ
 *
 * docs/preset-servers.json からプリセットサーバー情報を読み込み、
 * 初期ノードデータとして変換する機能を提供
 *
 * 関連ファイル:
 * - docs/preset-servers.json
 * - app/types/node.ts
 * - app/utils/node-validation.ts
 */

import type { Node, NetworkType, PresetServers } from "../types/node";
import { generateNodeId, normalizeNodeUrl } from "./node-validation";

/**
 * プリセットサーバーデータ（ビルド時に静的インポート）
 */
const presetServers: PresetServers = {
  TESTNET: [
    "https://sym-test-01.opening-line.jp:3001",
    "https://sym-test-03.opening-line.jp:3001",
    "https://symbol-azure.0009.co:3001",
    "https://201-sai-dual.symboltest.net:3001",
    "https://node-t.sixis.xyz:3001",
    "https://vmi831828.contaboserver.net:3001",
  ],
  MAINNET: [
    "https://sym-main-01.opening-line.jp:3001",
    "https://sym-main-02.opening-line.jp:3001",
    "https://sym-main-03.opening-line.jp:3001",
    "https://pasomi.net:3001",
    "https://sakia.harvestasya.com:3001",
    "https://shoestring.pasomi.net:3001",
  ],
};

/**
 * プリセットサーバーURLをNodeオブジェクトに変換
 */
function createPresetNode(
  url: string,
  network: NetworkType,
  index: number,
): Node {
  const normalizedUrl = normalizeNodeUrl(url);
  const nodeId = generateNodeId(); // nanoidベースのID生成
  const now = new Date().toISOString();

  // URLからフレンドリーな名前を生成
  const hostname = new URL(url).hostname;
  const friendlyName = hostname
    .replace(/^(sym-|symbol-|node-)/, "")
    .replace(/\.(jp|net|com|xyz)$/, "");

  return {
    id: nodeId,
    url: normalizedUrl,
    network,
    active: index === 0, // 各ネットワークの最初のノードをデフォルトでアクティブに
    memo: `プリセット${network}ノード: ${friendlyName}`,
    createdAt: now,
    status: "unknown",
    friendlyName: friendlyName,
  };
}

/**
 * プリセットノード一覧を取得
 */
export function getPresetNodes(): Node[] {
  const nodes: Node[] = [];

  // TESTNETノードを追加
  presetServers.TESTNET.forEach((url, index) => {
    try {
      const node = createPresetNode(url, "TESTNET", index);
      nodes.push(node);
    } catch (error) {
      console.warn(`プリセットTESTNETノードの作成に失敗: ${url}`, error);
    }
  });

  // MAINNETノードを追加
  presetServers.MAINNET.forEach((url, index) => {
    try {
      const node = createPresetNode(url, "MAINNET", index);
      nodes.push(node);
    } catch (error) {
      console.warn(`プリセットMAINNETノードの作成に失敗: ${url}`, error);
    }
  });

  return nodes;
}

/**
 * 特定のネットワークのプリセットノードを取得
 */
export function getPresetNodesByNetwork(network: NetworkType): Node[] {
  const allPresetNodes = getPresetNodes();
  return allPresetNodes.filter((node) => node.network === network);
}

/**
 * プリセットノードの初期化が必要かチェック
 */
export function shouldInitializePresetNodes(existingNodes: Node[]): boolean {
  if (existingNodes.length === 0) {
    return true;
  }

  // プリセットノードが一つもない場合は初期化が必要
  const presetNodes = getPresetNodes();
  const existingPresetNodes = existingNodes.filter((node) =>
    presetNodes.some((preset) => preset.id === node.id),
  );

  return existingPresetNodes.length === 0;
}

/**
 * 既存ノードにプリセットノードをマージ
 * 重複は既存ノードを優先
 */
export function mergeWithPresetNodes(existingNodes: Node[]): Node[] {
  const presetNodes = getPresetNodes();
  const existingNodeIds = new Set(existingNodes.map((node) => node.id));

  // 重複しないプリセットノードのみを追加
  const newPresetNodes = presetNodes.filter(
    (preset) => !existingNodeIds.has(preset.id),
  );

  return [...existingNodes, ...newPresetNodes];
}

/**
 * プリセットサーバー設定を取得
 */
export function getPresetServers(): PresetServers {
  return { ...presetServers };
}

/**
 * プリセットノードの統計情報を取得
 */
export function getPresetNodeStats() {
  const presetNodes = getPresetNodes();

  return {
    total: presetNodes.length,
    testnet: presetNodes.filter((node) => node.network === "TESTNET").length,
    mainnet: presetNodes.filter((node) => node.network === "MAINNET").length,
    servers: presetServers,
  };
}
