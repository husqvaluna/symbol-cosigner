/**
 * トランザクション管理のためのJotai atoms
 *
 * 設計方針:
 * - アトミックな状態管理
 * - 非同期データ取得の適切な処理
 * - 既存のaddresses/nodes atomパターン踏襲
 * - エラーハンドリングとローディング状態
 *
 * 関連ファイル:
 * - app/types/transaction.ts
 * - app/utils/symbol-api.ts
 * - app/store/addresses.ts
 * - app/store/nodes.ts
 */

import { atom } from "jotai";
import type {
  DisplayTransaction,
  TransactionListState,
  FetchPartialTransactionsParams,
} from "../types/transaction";
import { fetchPartialTransactions } from "../utils/symbol-api";
import { activeAddressAtom } from "./addresses";
import { activeNodeAtom } from "./nodes";

// ===== プリミティブAtoms =====

/**
 * トランザクション一覧の基本状態
 */
export const transactionListStateAtom = atom<TransactionListState>({
  transactions: [],
  loading: false,
  error: null,
  lastUpdated: null,
});

/**
 * 手動リフレッシュトリガー
 */
export const refreshTriggerAtom = atom<number>(0);

// ===== 派生Atoms (Derived Atoms) =====

/**
 * トランザクション統計情報
 */
export const transactionStatsAtom = atom((get) => {
  const state = get(transactionListStateAtom);
  const transactions = state.transactions;

  return {
    total: transactions.length,
    withCosignatures: transactions.filter(tx => tx.cosignatureCount > 0).length,
    withoutCosignatures: transactions.filter(tx => tx.cosignatureCount === 0).length,
  };
});

/**
 * 現在のアドレス・ノード情報に基づくAPI取得パラメータ
 */
const fetchParamsAtom = atom((get) => {
  const activeAddress = get(activeAddressAtom);
  const activeNode = get(activeNodeAtom);

  if (!activeAddress || !activeNode) {
    return null;
  }

  return {
    nodeUrl: activeNode.url,
    address: activeAddress.address,
  } as FetchPartialTransactionsParams;
});

/**
 * API取得可能状態チェック
 */
export const canFetchTransactionsAtom = atom((get) => {
  const params = get(fetchParamsAtom);
  return params !== null;
});

/**
 * 不足している要素の確認
 */
export const missingRequirementsAtom = atom((get) => {
  const activeAddress = get(activeAddressAtom);
  const activeNode = get(activeNodeAtom);

  const missing: string[] = [];
  
  if (!activeAddress) {
    missing.push('アクティブなアドレス');
  }
  
  if (!activeNode) {
    missing.push('アクティブなノード');
  }

  return missing;
});

// ===== アクションAtoms =====

/**
 * トランザクション一覧取得アクション
 */
export const fetchTransactionsAtom = atom(
  null,
  async (get, set) => {
    const params = get(fetchParamsAtom);
    
    if (!params) {
      set(transactionListStateAtom, prev => ({
        ...prev,
        error: 'アクティブなアドレスとノードが必要です',
        loading: false,
      }));
      return;
    }

    // ローディング開始
    set(transactionListStateAtom, prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await fetchPartialTransactions(params);

      if (result.success) {
        set(transactionListStateAtom, {
          transactions: result.data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        set(transactionListStateAtom, prev => ({
          ...prev,
          loading: false,
          error: result.error.message,
        }));
      }
    } catch (error) {
      set(transactionListStateAtom, prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
      }));
    }
  }
);

/**
 * リフレッシュアクション
 */
export const refreshTransactionsAtom = atom(
  null,
  async (get, set) => {
    // リフレッシュトリガーを増加
    const currentTrigger = get(refreshTriggerAtom);
    set(refreshTriggerAtom, currentTrigger + 1);

    // データを再取得
    await set(fetchTransactionsAtom);
  }
);

/**
 * エラークリアアクション
 */
export const clearTransactionErrorAtom = atom(
  null,
  (get, set) => {
    set(transactionListStateAtom, prev => ({
      ...prev,
      error: null,
    }));
  }
);

/**
 * ローディング状態リセットアクション
 */
export const resetTransactionLoadingAtom = atom(
  null,
  (get, set) => {
    set(transactionListStateAtom, prev => ({
      ...prev,
      loading: false,
    }));
  }
);

/**
 * 全状態リセットアクション
 */
export const resetTransactionStateAtom = atom(
  null,
  (get, set) => {
    set(transactionListStateAtom, {
      transactions: [],
      loading: false,
      error: null,
      lastUpdated: null,
    });
    set(refreshTriggerAtom, 0);
  }
);

// ===== 自動更新関連Atoms =====

/**
 * 自動リフレッシュ有効フラグ
 */
export const autoRefreshEnabledAtom = atom<boolean>(false);

/**
 * 自動リフレッシュ間隔（秒）
 */
export const autoRefreshIntervalAtom = atom<number>(30);

/**
 * 最後の自動リフレッシュ時刻
 */
export const lastAutoRefreshAtom = atom<Date | null>(null);

/**
 * 自動リフレッシュ切り替えアクション
 */
export const toggleAutoRefreshAtom = atom(
  null,
  (get, set) => {
    const currentEnabled = get(autoRefreshEnabledAtom);
    set(autoRefreshEnabledAtom, !currentEnabled);
    
    if (!currentEnabled) {
      // 自動リフレッシュ有効化時は即座にリフレッシュ
      set(refreshTransactionsAtom);
    }
  }
);

// ===== 読み取り専用派生Atoms =====

/**
 * トランザクション一覧（読み取り専用）
 */
export const transactionsAtom = atom(
  (get) => get(transactionListStateAtom).transactions
);

/**
 * ローディング状態（読み取り専用）
 */
export const transactionsLoadingAtom = atom(
  (get) => get(transactionListStateAtom).loading
);

/**
 * エラー状態（読み取り専用）
 */
export const transactionsErrorAtom = atom(
  (get) => get(transactionListStateAtom).error
);

/**
 * 最終更新日時（読み取り専用）
 */
export const lastUpdatedAtom = atom(
  (get) => get(transactionListStateAtom).lastUpdated
);