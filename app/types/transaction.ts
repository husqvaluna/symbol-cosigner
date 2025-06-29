/**
 * Symbol REST API トランザクション関連の型定義
 *
 * 設計方針:
 * - OpenAPI仕様に基づいた正確な型定義
 * - Symbol SDKとの互換性確保
 * - UI表示用の変換型も提供
 *
 * 関連ファイル:
 * - docs/openapi-symbol.yml
 * - docs/examples/cosign.ts
 * - plans/check_if_already_signed.md
 */

// ===== REST API レスポンス型 =====

/**
 * トランザクションメタデータ
 */
export interface TransactionMetaDTO {
  /** ブロック高 */
  height: string;
  /** トランザクションハッシュ */
  hash: string;
  /** マークル木コンポーネントハッシュ */
  merkleComponentHash: string;
  /** インデックス */
  index: number;
}

/**
 * 連署情報
 */
export interface CosignatureDTO {
  /** バージョン */
  version: string;
  /** 署名者公開鍵 */
  signerPublicKey: string;
  /** 署名 */
  signature: string;
}

/**
 * アグリゲートボンデッドトランザクション
 */
export interface AggregateBondedTransactionDTO {
  /** サイズ */
  size: number;
  /** 署名 */
  signature: string;
  /** 署名者公開鍵 */
  signerPublicKey: string;
  /** バージョン */
  version: number;
  /** ネットワーク */
  network: number;
  /** トランザクションタイプ (16961 = AggregateBonded) */
  type: 16961;
  /** 期限 */
  deadline: string;
  /** 内包トランザクションのハッシュ */
  transactionsHash: string;
  /** 連署情報一覧 */
  cosignatures: CosignatureDTO[];
}

/**
 * 部分トランザクション情報
 */
export interface PartialTransactionInfoDTO {
  /** データベースID */
  id: string;
  /** メタデータ */
  meta: TransactionMetaDTO;
  /** トランザクション詳細 */
  transaction: AggregateBondedTransactionDTO;
}

/**
 * ページネーション情報
 */
export interface PaginationDTO {
  /** ページ番号 */
  pageNumber: number;
  /** ページサイズ */
  pageSize: number;
}

/**
 * 部分トランザクション検索レスポンス
 */
export interface PartialTransactionsResponseDTO {
  /** トランザクション一覧 */
  data: PartialTransactionInfoDTO[];
  /** ページネーション情報 */
  pagination: PaginationDTO;
}

// ===== API パラメータ型 =====

/**
 * 部分トランザクション検索パラメータ
 */
export interface FetchPartialTransactionsParams {
  /** ノードURL */
  nodeUrl: string;
  /** 対象アドレス */
  address: string;
  /** トランザクションタイプ (デフォルト: 16961) */
  type?: number;
  /** ページサイズ (10-100, デフォルト: 100) */
  pageSize?: number;
  /** ページ番号 (デフォルト: 1) */
  pageNumber?: number;
  /** ソート順 (デフォルト: desc) */
  order?: "asc" | "desc";
}

// ===== UI表示用型 =====

/**
 * 表示用トランザクション情報
 */
export interface DisplayTransaction {
  /** データベースID */
  id: string;
  /** トランザクションハッシュ */
  hash: string;
  /** 署名者公開鍵 */
  signerPublicKey: string;
  /** 署名者アドレス */
  signerAddress: string;
  /** 期限 */
  deadline: string;
  /** 連署者数 */
  cosignatureCount: number;
  /** 連署者公開鍵一覧 */
  cosignerPublicKeys: string[];
  /** 連署者アドレス一覧 */
  cosignerAddresses: string[];
  /** 作成日時（表示用） */
  createdAt: Date;
}

/**
 * トランザクション一覧の状態
 */
export interface TransactionListState {
  /** トランザクション一覧 */
  transactions: DisplayTransaction[];
  /** 読み込み中フラグ */
  loading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 最終更新日時 */
  lastUpdated: Date | null;
}

// ===== ユーティリティ関数用型 =====

/**
 * API エラーレスポンス
 */
export interface ApiError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
}

/**
 * API 成功/失敗の結果型
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ===== 署名関連の型定義 =====

/**
 * 連署データ（アナウンス用）
 */
export interface CosignaturePayload {
  /** 親トランザクションハッシュ */
  parentHash: string;
  /** 署名 */
  signature: string;
  /** 署名者公開鍵 */
  signerPublicKey: string;
  /** バージョン */
  version: string;
}

/**
 * 署名処理の状態
 */
export type SigningStatus =
  | "idle"
  | "signing"
  | "announcing"
  | "success"
  | "error";

/**
 * 署名処理の状態管理
 */
export interface SigningState {
  /** 署名中のトランザクションハッシュ */
  transactionHash: string | null;
  /** 署名処理の状態 */
  status: SigningStatus;
  /** 生成された連署データ */
  cosignature: CosignaturePayload | null;
  /** エラーメッセージ */
  error: string | null;
  /** 成功メッセージ */
  successMessage: string | null;
  /** 最終更新日時 */
  lastUpdated: Date | null;
}

/**
 * 署名リクエストパラメータ
 */
export interface SignRequestParams {
  /** トランザクションハッシュ */
  transactionHash: string;
  /** 秘密鍵 */
  privateKey: string;
  /** ノードURL */
  nodeUrl: string;
  /** ネットワークタイプ */
  networkType: "TESTNET" | "MAINNET";
}

/**
 * 署名完了イベント
 */
export interface SigningCompletedEvent {
  /** トランザクションハッシュ */
  transactionHash: string;
  /** 成功フラグ */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 署名者公開鍵（成功時） */
  signerPublicKey?: string;
}
