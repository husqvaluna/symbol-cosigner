/**
 * 秘密鍵入力モーダルコンポーネント
 * 
 * 設計方針:
 * - セキュアな秘密鍵入力とバリデーション
 * - 入力後の即座なメモリクリア
 * - 既存のModalパターンとTailwindCSSスタイルに準拠
 * 
 * 関連ファイル:
 * - app/routes/pending.$transactionHash.tsx
 * - app/components/AddressModal.tsx (参考パターン)
 * - docs/examples/cosign.ts (Symbol SDK使用例)
 */

import { useState, useRef, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { PrivateKey } from "symbol-sdk";
import {
  executeSigningAtom,
  signingStateAtom,
  isSigningAtom,
  signingProgressMessageAtom,
  resetSigningAtom,
  canSignAtom,
} from "../store/signing";
import { activeNodeAtom } from "../store/nodes";

interface PrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionHash: string;
}

export function PrivateKeyModal({ isOpen, onClose, transactionHash }: PrivateKeyModalProps) {
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Jotai atoms
  const signingState = useAtomValue(signingStateAtom);
  const isSigning = useAtomValue(isSigningAtom);
  const progressMessage = useAtomValue(signingProgressMessageAtom);
  const { canSign, missingRequirements } = useAtomValue(canSignAtom);
  const activeNode = useAtomValue(activeNodeAtom);
  const [, executeSigning] = useAtom(executeSigningAtom);
  const [, resetSigning] = useAtom(resetSigningAtom);

  // モーダルが開いたときにフォーカスを設定
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // モーダルが閉じられるときに秘密鍵をクリア
  useEffect(() => {
    if (!isOpen) {
      clearPrivateKey();
      resetSigning();
    }
  }, [isOpen, resetSigning]);

  // 署名完了時の処理は削除（手動でモーダルを閉じる）

  // 秘密鍵の安全なクリア
  const clearPrivateKey = () => {
    setPrivateKey("");
    setError("");
    setShowPrivateKey(false);
  };

  // 秘密鍵バリデーション
  const validatePrivateKey = (key: string): boolean => {
    try {
      // 空文字チェック
      if (!key.trim()) {
        setError("秘密鍵を入力してください");
        return false;
      }

      // 長さチェック（64文字のHEX）
      if (key.length !== 64) {
        setError("秘密鍵は64文字の16進数である必要があります");
        return false;
      }

      // HEX形式チェック
      if (!/^[0-9A-Fa-f]{64}$/.test(key)) {
        setError("秘密鍵は16進数（0-9, A-F）で入力してください");
        return false;
      }

      // Symbol SDK による検証
      new PrivateKey(key);
      
      setError("");
      return true;
    } catch (err) {
      setError("無効な秘密鍵形式です");
      return false;
    }
  };

  // 入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    setPrivateKey(value);
    
    // リアルタイムエラークリア
    if (error && value.length > 0) {
      setError("");
    }
  };

  // 署名実行ハンドラ
  const handleSign = async () => {
    if (!validatePrivateKey(privateKey)) {
      return;
    }

    if (!canSign) {
      setError(missingRequirements.join(', '));
      return;
    }

    if (!activeNode) {
      setError('アクティブなノードが設定されていません');
      return;
    }

    try {
      await executeSigning({
        transactionHash,
        privateKey,
        nodeUrl: activeNode.url,
        networkType: activeNode.network,
      });
      
      // 成功時は秘密鍵をクリア
      clearPrivateKey();
      
    } catch (error) {
      setError('署名処理中に予期しないエラーが発生しました');
    }
  };

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSigning && privateKey && canSign) {
      e.preventDefault();
      handleSign();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // キャンセルハンドラ
  const handleCancel = () => {
    clearPrivateKey();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">署名の実行</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* トランザクション情報 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">署名対象トランザクション:</div>
            <code className="text-xs font-mono text-gray-800 break-all">
              {transactionHash}
            </code>
          </div>

          {/* 秘密鍵入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              秘密鍵 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPrivateKey ? "text" : "password"}
                value={privateKey}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="64文字の16進数を入力してください"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                maxLength={64}
                disabled={isSigning}
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isSigning}
              >
                {showPrivateKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l.242.242M14.12 14.12l4.242 4.242M14.12 14.12L15.536 15.536M14.12 14.12l-.242-.242" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {privateKey.length}/64 文字
            </div>
          </div>

          {/* エラー表示 */}
          {(error || signingState.error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">{error || signingState.error}</div>
            </div>
          )}

          {/* プログレス表示 */}
          {isSigning && progressMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm text-blue-800">{progressMessage}</div>
              </div>
            </div>
          )}

          {/* 成功表示 */}
          {signingState.status === 'success' && signingState.successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-sm text-green-800">{signingState.successMessage}</div>
              </div>
            </div>
          )}

          {/* セキュリティ注意事項 */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-yellow-800">セキュリティ注意事項</div>
                <div className="text-xs text-yellow-700 mt-1">
                  • 秘密鍵は署名後すぐにメモリから削除されます<br/>
                  • 信頼できる環境でのみ入力してください<br/>
                  • 秘密鍵は他者と共有しないでください
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSigning}
            >
              キャンセル
            </button>
            <button
              onClick={handleSign}
              disabled={!privateKey || isSigning || !!error || !canSign}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSigning && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSigning ? progressMessage : "署名実行"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}