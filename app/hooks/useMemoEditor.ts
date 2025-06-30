/**
 * メモ編集ロジックの共通化カスタムフック
 *
 * 設計方針:
 * - 状態管理（memo, originalMemo, isLoading）の共通化
 * - 変更差分検知とバリデーション
 * - 保存・キャンセル処理の統一
 * - エラーハンドリングの標準化
 *
 * 関連ファイル:
 * - app/components/MemoEditor.tsx
 * - app/routes/nodes.$id.tsx
 * - app/routes/addresses.$address.tsx
 */

import { useEffect, useState } from "react";

export interface UseMemoEditorReturn {
  memo: string;
  originalMemo: string;
  isLoading: boolean;
  hasChanges: boolean;
  setMemo: (memo: string) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export function useMemoEditor(
  initialMemo: string,
  onSave: (memo: string) => Promise<void>,
): UseMemoEditorReturn {
  const [memo, setMemo] = useState("");
  const [originalMemo, setOriginalMemo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 初期値の設定
  useEffect(() => {
    const normalizedMemo = initialMemo || "";
    setMemo(normalizedMemo);
    setOriginalMemo(normalizedMemo);
  }, [initialMemo]);

  // 変更差分検知
  const hasChanges = memo.trim() !== originalMemo.trim();

  // 保存処理
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      await onSave(memo.trim());
      setOriginalMemo(memo.trim());
    } catch (error) {
      console.error("メモ保存エラー:", error);
      alert(
        error instanceof Error ? error.message : "メモの保存に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setMemo(originalMemo);
  };

  return {
    memo,
    originalMemo,
    isLoading,
    hasChanges,
    setMemo,
    handleSave,
    handleCancel,
  };
}
