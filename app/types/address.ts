/**
 * Symbol アドレス型定義
 * 仕様: @plans/specs.md 参照
 *
 * Symbol アドレスは39文字のBase32エンコード済みテキスト
 * アプリケーション内では常に正規化された形式（ハイフンなし、大文字）で管理
 */

export interface Address {
  /** 正規化済み39文字のSymbolアドレス */
  address: string;

  /** ユーザー定義のメモ */
  memo: string;

  /** このアドレスが現在使用中かどうか */
  active: boolean;

  /** アドレス作成日時（ISO文字列） */
  createdAt: string;

  /** 最終使用日時（ISO文字列、任意） */
  lastUsedAt?: string;

  /** キャッシュされた公開鍵（任意） */
  publicKey?: string;

  /** キャッシュされた残高（XYM、任意） */
  balance?: string;
}

/**
 * アドレス作成時のパラメータ
 */
export interface CreateAddressParams {
  address: string;
  memo?: string;
  active?: boolean;
}

/**
 * アドレス更新時のパラメータ
 */
export interface UpdateAddressParams {
  address: string;
  memo?: string;
  active?: boolean;
  publicKey?: string;
  balance?: string;
  lastUsedAt?: string;
}

/**
 * アドレス検索・フィルタリング用の型
 */
export interface AddressFilter {
  /** アクティブなアドレスのみ */
  activeOnly?: boolean;

  /** メモでの部分一致検索 */
  memoSearch?: string;

  /** アドレスでの部分一致検索 */
  addressSearch?: string;
}
