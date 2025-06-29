/**
 * 署名処理のためのJotai atoms
 * 
 * 設計方針:
 * - アトミックな状態管理
 * - 非同期署名処理の適切な管理
 * - エラーハンドリングとローディング状態
 * - 既存のStoreパターン踏襲
 * 
 * 関連ファイル:
 * - app/types/transaction.ts
 * - app/utils/symbol-sign.ts
 * - app/utils/symbol-api.ts
 * - app/store/addresses.ts
 * - app/store/nodes.ts
 */

import { atom } from "jotai";
import type {
  SigningState,
  SignRequestParams,
  SigningCompletedEvent,
  CosignaturePayload,
} from "../types/transaction";
import type { NetworkType } from "../types/node";
import { signTransaction } from "../utils/symbol-sign";
import { announceCosignature } from "../utils/symbol-api";
import { activeAddressAtom } from "./addresses";
import { activeNodeAtom } from "./nodes";

// ===== プリミティブAtoms =====

/**
 * 署名処理の基本状態
 */
export const signingStateAtom = atom<SigningState>({
  transactionHash: null,
  status: 'idle',
  cosignature: null,
  error: null,
  successMessage: null,
  lastUpdated: null,
});

// ===== 派生Atoms (Derived Atoms) =====

/**
 * 署名処理中フラグ
 */
export const isSigningAtom = atom((get) => {
  const state = get(signingStateAtom);
  return state.status === 'signing' || state.status === 'announcing';
});

/**
 * 署名処理が利用可能かチェック
 */
export const canSignAtom = atom((get) => {
  const activeAddress = get(activeAddressAtom);
  const activeNode = get(activeNodeAtom);
  const signingState = get(signingStateAtom);
  
  return {
    canSign: !!(activeAddress && activeNode && signingState.status !== 'signing' && signingState.status !== 'announcing'),
    missingRequirements: [
      ...(!activeAddress ? ['アクティブなアドレスが設定されていません'] : []),
      ...(!activeNode ? ['アクティブなノードが設定されていません'] : []),
      ...(signingState.status === 'signing' || signingState.status === 'announcing' ? ['別の署名処理が実行中です'] : []),
    ],
  };
});

// ===== アクションAtoms (Write-only Atoms) =====

/**
 * 署名処理をリセット
 */
export const resetSigningAtom = atom(
  null,
  (get, set) => {
    set(signingStateAtom, {
      transactionHash: null,
      status: 'idle',
      cosignature: null,
      error: null,
      successMessage: null,
      lastUpdated: null,
    });
  }
);

/**
 * エラー状態をクリア
 */
export const clearSigningErrorAtom = atom(
  null,
  (get, set) => {
    const currentState = get(signingStateAtom);
    if (currentState.status === 'error') {
      set(signingStateAtom, {
        ...currentState,
        status: 'idle',
        error: null,
        lastUpdated: new Date(),
      });
    }
  }
);

/**
 * 署名とアナウンスを実行
 */
export const executeSigningAtom = atom(
  null,
  async (get, set, params: SignRequestParams) => {
    const activeAddress = get(activeAddressAtom);
    const activeNode = get(activeNodeAtom);
    
    // 必須条件チェック
    if (!activeAddress || !activeNode) {
      set(signingStateAtom, {
        transactionHash: params.transactionHash,
        status: 'error',
        cosignature: null,
        error: 'アクティブなアドレスまたはノードが設定されていません',
        successMessage: null,
        lastUpdated: new Date(),
      });
      return;
    }
    
    // 署名開始
    set(signingStateAtom, {
      transactionHash: params.transactionHash,
      status: 'signing',
      cosignature: null,
      error: null,
      successMessage: null,
      lastUpdated: new Date(),
    });
    
    try {
      // Step 1: 署名処理
      const signResult = await signTransaction({
        privateKey: params.privateKey,
        transactionHash: params.transactionHash,
        network: params.networkType,
      });
      
      if (!signResult.success) {
        set(signingStateAtom, {
          transactionHash: params.transactionHash,
          status: 'error',
          cosignature: null,
          error: signResult.error || '署名処理に失敗しました',
          successMessage: null,
          lastUpdated: new Date(),
        });
        return;
      }
      
      // Step 2: アナウンス準備
      set(signingStateAtom, {
        transactionHash: params.transactionHash,
        status: 'announcing',
        cosignature: signResult.cosignature || null,
        error: null,
        successMessage: null,
        lastUpdated: new Date(),
      });
      
      // Step 3: アナウンス実行
      const announceResult = await announceCosignature(
        activeNode.url,
        signResult.cosignature!
      );
      
      if (!announceResult.success) {
        set(signingStateAtom, {
          transactionHash: params.transactionHash,
          status: 'error',
          cosignature: signResult.cosignature || null,
          error: announceResult.error?.message || 'アナウンスに失敗しました',
          successMessage: null,
          lastUpdated: new Date(),
        });
        return;
      }
      
      // Step 4: 成功完了
      set(signingStateAtom, {
        transactionHash: params.transactionHash,
        status: 'success',
        cosignature: signResult.cosignature || null,
        error: null,
        successMessage: announceResult.data?.message || '署名とアナウンスが完了しました',
        lastUpdated: new Date(),
      });
      
    } catch (error) {
      set(signingStateAtom, {
        transactionHash: params.transactionHash,
        status: 'error',
        cosignature: null,
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        successMessage: null,
        lastUpdated: new Date(),
      });
    }
  }
);

/**
 * 署名完了イベント生成（コンポーネント間通信用）
 */
export const getSigningCompletedEventAtom = atom((get): SigningCompletedEvent | null => {
  const state = get(signingStateAtom);
  
  if (!state.transactionHash) {
    return null;
  }
  
  if (state.status === 'success') {
    return {
      transactionHash: state.transactionHash,
      success: true,
      signerPublicKey: state.cosignature?.signerPublicKey,
    };
  }
  
  if (state.status === 'error') {
    return {
      transactionHash: state.transactionHash,
      success: false,
      error: state.error || '不明なエラー',
    };
  }
  
  return null;
});

// ===== 便利なSelector Atoms =====

/**
 * 現在の署名対象トランザクションハッシュ
 */
export const currentSigningTransactionAtom = atom((get) => {
  const state = get(signingStateAtom);
  return state.transactionHash;
});

/**
 * 署名処理の進捗メッセージ
 */
export const signingProgressMessageAtom = atom((get) => {
  const state = get(signingStateAtom);
  
  switch (state.status) {
    case 'idle':
      return null;
    case 'signing':
      return '署名を作成中...';
    case 'announcing':
      return 'ネットワークにアナウンス中...';
    case 'success':
      return state.successMessage || '署名完了';
    case 'error':
      return state.error || 'エラーが発生しました';
    default:
      return null;
  }
});

/**
 * 署名の詳細結果情報
 */
export const signingResultDetailsAtom = atom((get) => {
  const state = get(signingStateAtom);
  
  if (state.status !== 'success' || !state.cosignature) {
    return null;
  }
  
  return {
    transactionHash: state.transactionHash,
    signerPublicKey: state.cosignature.signerPublicKey,
    signature: state.cosignature.signature,
    completedAt: state.lastUpdated,
  };
});