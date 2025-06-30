/**
 * 統一メモ編集コンポーネント
 * 
 * 設計方針:
 * - ノード詳細とアドレス詳細で共通のメモ編集UI
 * - 変更差分検知による保存ボタン制御
 * - ローディング状態管理
 * - エラーハンドリング統一
 * 
 * 関連ファイル:
 * - app/routes/nodes.$id.tsx
 * - app/routes/addresses.$address.tsx
 * - app/hooks/useMemoEditor.ts
 */

import { useMemoEditor } from "../hooks/useMemoEditor";

export interface MemoEditorProps {
  initialMemo: string;
  onSave: (memo: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function MemoEditor({ 
  initialMemo, 
  onSave, 
  placeholder = "メモを入力...",
  disabled = false 
}: MemoEditorProps) {
  const {
    memo,
    isLoading,
    hasChanges,
    setMemo,
    handleSave,
    handleCancel,
  } = useMemoEditor(initialMemo, onSave);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">メモ</h2>
      <textarea
        className="w-full p-3 border rounded-lg resize-none"
        rows={4}
        placeholder={placeholder}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        disabled={isLoading || disabled}
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isLoading || disabled}
          className={`px-4 py-2 rounded transition-colors ${
            !hasChanges || isLoading || disabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isLoading ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!hasChanges || isLoading || disabled}
          className={`px-4 py-2 rounded transition-colors ${
            !hasChanges || isLoading || disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}