import { useState, useEffect } from "react";
import { validateSymbolAddress } from "../utils/address-validation";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: string, memo?: string) => void;
}

export function AddressModal({ isOpen, onClose, onSubmit }: AddressModalProps) {
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: false });

  // モーダルが開かれた時にフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setAddress("");
      setMemo("");
      setValidationResult({ isValid: false });
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // アドレス入力のバリデーション
  const handleAddressChange = (value: string) => {
    setAddress(value);
    
    if (value.trim() === "") {
      setValidationResult({ isValid: false });
      return;
    }

    const result = validateSymbolAddress(value);
    setValidationResult(result);
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = validateSymbolAddress(address);
    if (result.isValid && result.normalizedAddress) {
      onSubmit(result.normalizedAddress, memo.trim() || undefined);
      onClose();
    }
  };

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">新しいアドレスを追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="モーダルを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Symbol アドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="例: PDIEJ3OD3SFYNZCQUSEWKY4NRRZUI5LMJPSVLPQ"
              className={`w-full p-3 border rounded-lg font-mono text-sm ${
                address && !validationResult.isValid
                  ? "border-red-300 bg-red-50"
                  : address && validationResult.isValid
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300"
              }`}
              maxLength={45} // ハイフン付きの最大長
            />
            {address && validationResult.error && (
              <p className="mt-1 text-sm text-red-600">{validationResult.error}</p>
            )}
            {address && validationResult.isValid && (
              <p className="mt-1 text-sm text-green-600">有効なアドレスです</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              39文字のアドレス、またはハイフン区切りの45文字アドレスを入力してください
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              メモ（任意）
            </label>
            <input
              id="memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="このアドレスの用途など"
              className="w-full p-3 border border-gray-300 rounded-lg"
              maxLength={100}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!validationResult.isValid}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                validationResult.isValid
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}