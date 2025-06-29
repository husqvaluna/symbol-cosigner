/**
 * Symbol ノード型定義
 * 仕様: @plans/specs.md 参照
 *
 * Symbol REST API /node/info エンドポイントと連携して
 * ノードの状態とメタデータを管理
 */

/**
 * Symbol ネットワーク種別
 */
export type NetworkType = "TESTNET" | "MAINNET";

/**
 * ノードの接続状態
 */
export type NodeStatus = "online" | "offline" | "unknown";

/**
 * Symbol ノード情報
 */
export interface Node {
  /** ノードの一意識別子 */
  id: string;

  /** ノードのREST API URL */
  url: string;

  /** ネットワーク種別 */
  network: NetworkType;

  /** このノードが現在使用中かどうか */
  active: boolean;

  /** ユーザー定義のメモ */
  memo: string;

  /** ノード追加日時（ISO文字列） */
  createdAt: string;

  /** 最終使用日時（ISO文字列、任意） */
  lastUsedAt?: string;

  // === Symbol REST API /node/info から取得される情報 ===

  /** ノードバージョン */
  version?: string;

  /** ノードの公開鍵 */
  publicKey?: string;

  /** ネットワーク生成ハッシュシード */
  networkGenerationHashSeed?: string;

  /** ネットワーク識別子 */
  networkIdentifier?: number;

  /** ノードの役割 */
  roles?: number;

  /** ポート番号 */
  port?: number;

  /** ノードのホスト名 */
  host?: string;

  /** ノードの友好名 */
  friendlyName?: string;

  // === ヘルスチェック情報 ===

  /** ノードの接続状態 */
  status: NodeStatus;

  /** 応答時間（ミリ秒） */
  responseTime?: number;

  /** 最終チェック日時（ISO文字列） */
  lastCheckedAt?: string;

  /** 最後のエラーメッセージ */
  lastError?: string;
}

/**
 * ノード作成時のパラメータ
 */
export interface CreateNodeParams {
  url: string;
  network: NetworkType;
  memo?: string;
  active?: boolean;
}

/**
 * ノード更新時のパラメータ
 */
export interface UpdateNodeParams {
  id: string;
  url?: string;
  network?: NetworkType;
  memo?: string;
  active?: boolean;
  version?: string;
  publicKey?: string;
  networkGenerationHashSeed?: string;
  networkIdentifier?: number;
  roles?: number;
  port?: number;
  host?: string;
  friendlyName?: string;
  status?: NodeStatus;
  responseTime?: number;
  lastUsedAt?: string;
  lastCheckedAt?: string;
  lastError?: string;
}

/**
 * ノード検索・フィルタリング用の型
 */
export interface NodeFilter {
  /** アクティブなノードのみ */
  activeOnly?: boolean;

  /** 特定のネットワークのみ */
  network?: NetworkType;

  /** 特定のステータスのみ */
  status?: NodeStatus;

  /** メモでの部分一致検索 */
  memoSearch?: string;

  /** URLでの部分一致検索 */
  urlSearch?: string;

  /** オンラインノードのみ */
  onlineOnly?: boolean;
}

/**
 * ノード統計情報
 */
export interface NodeStats {
  /** 総ノード数 */
  total: number;

  /** アクティブノード数 */
  active: number;

  /** オンラインノード数 */
  online: number;

  /** オフラインノード数 */
  offline: number;

  /** 不明状態ノード数 */
  unknown: number;

  /** TESTNETノード数 */
  testnet: number;

  /** MAINNETノード数 */
  mainnet: number;
}

/**
 * ノードヘルスチェック結果
 */
export interface NodeHealthCheck {
  /** ノードID */
  nodeId: string;

  /** チェック実行日時 */
  checkedAt: string;

  /** 接続状態 */
  status: NodeStatus;

  /** 応答時間（ミリ秒） */
  responseTime?: number;

  /** エラーメッセージ */
  error?: string;

  /** 取得したノード情報 */
  nodeInfo?: {
    version?: string;
    publicKey?: string;
    networkGenerationHashSeed?: string;
    networkIdentifier?: number;
    roles?: number;
    port?: number;
    host?: string;
    friendlyName?: string;
  };
}

/**
 * プリセットサーバー設定
 */
export interface PresetServers {
  TESTNET: string[];
  MAINNET: string[];
}
