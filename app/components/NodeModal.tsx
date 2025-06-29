import { useCallback, useEffect, useState } from "react";
import type { CreateNodeParams, NetworkType } from "../types/node";
import {
  detectNodeNetwork,
  normalizeNodeUrl,
  validateNodeUrl,
} from "../utils/node-validation";

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: CreateNodeParams) => void;
}

interface NodeDetectionState {
  isLoading: boolean;
  network: NetworkType | null;
  nodeInfo: any | null;
  error: string | null;
}

export function NodeModal({ isOpen, onClose, onSubmit }: NodeModalProps) {
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: false });
  const [detection, setDetection] = useState<NodeDetectionState>({
    isLoading: false,
    network: null,
    nodeInfo: null,
    error: null,
  });

  // モーダルが開かれた時にフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setMemo("");
      setUrlValidation({ isValid: false });
      setDetection({
        isLoading: false,
        network: null,
        nodeInfo: null,
        error: null,
      });
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

  // デバウンス処理でノード検出を実行
  const debouncedDetectNode = useCallback(
    debounce(async (nodeUrl: string) => {
      if (!nodeUrl.trim() || !urlValidation.isValid) {
        return;
      }

      setDetection((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await detectNodeNetwork(normalizeNodeUrl(nodeUrl));

        if ("error" in result) {
          setDetection({
            isLoading: false,
            network: null,
            nodeInfo: null,
            error: result.error,
          });
        } else {
          setDetection({
            isLoading: false,
            network: result.network,
            nodeInfo: result.nodeInfo,
            error: null,
          });

          // ノード情報からメモの初期値を生成
          if (!memo && result.nodeInfo.friendlyName) {
            setMemo(`${result.network}ノード: ${result.nodeInfo.friendlyName}`);
          }
        }
      } catch (error) {
        setDetection({
          isLoading: false,
          network: null,
          nodeInfo: null,
          error: "ノード情報の取得に失敗しました",
        });
      }
    }, 500),
    [urlValidation.isValid, memo],
  );

  // URL入力のバリデーションとノード検出
  const handleUrlChange = (value: string) => {
    setUrl(value);

    if (value.trim() === "") {
      setUrlValidation({ isValid: false });
      setDetection({
        isLoading: false,
        network: null,
        nodeInfo: null,
        error: null,
      });
      return;
    }

    const validation = validateNodeUrl(value);
    setUrlValidation(validation);

    // バリデーション成功時にノード検出を実行
    if (validation.isValid) {
      debouncedDetectNode(value);
    } else {
      setDetection({
        isLoading: false,
        network: null,
        nodeInfo: null,
        error: null,
      });
    }
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlValidation.isValid || !detection.network) {
      return;
    }

    const params: CreateNodeParams = {
      url: normalizeNodeUrl(url),
      network: detection.network,
      memo: memo.trim() || undefined,
    };

    onSubmit(params);
    onClose();
  };

  // 送信可能かどうかの判定
  const canSubmit =
    urlValidation.isValid &&
    detection.network &&
    !detection.isLoading &&
    !detection.error;

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">新しいノードを追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="モーダルを閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="nodeUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ノードURL <span className="text-red-500">*</span>
            </label>
            <input
              id="nodeUrl"
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="例: https://sym-test-01.opening-line.jp:3001"
              className={`w-full p-3 border rounded-lg font-mono text-sm ${
                url && !urlValidation.isValid
                  ? "border-red-300 bg-red-50"
                  : url && urlValidation.isValid
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
              }`}
            />
            {url && urlValidation.error && (
              <p className="mt-1 text-sm text-red-600">{urlValidation.error}</p>
            )}
            {url && urlValidation.isValid && !detection.error && (
              <p className="mt-1 text-sm text-green-600">有効なURLです</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              HTTPSのSymbol REST APIのURLを入力してください
            </p>
          </div>

          {/* ネットワーク検出結果 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ネットワーク情報
            </label>
            <div className="border rounded-lg p-3 bg-gray-50">
              {detection.isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  ノード情報を取得中...
                </div>
              )}

              {detection.error && (
                <p className="text-sm text-red-600">{detection.error}</p>
              )}

              {detection.network && detection.nodeInfo && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        detection.network === "TESTNET"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {detection.network}
                    </span>
                    {detection.nodeInfo.friendlyName && (
                      <span className="text-sm text-gray-600">
                        {detection.nodeInfo.friendlyName}
                      </span>
                    )}
                  </div>
                  {detection.nodeInfo.version && (
                    <p className="text-xs text-gray-500">
                      バージョン: {detection.nodeInfo.version}
                    </p>
                  )}
                </div>
              )}

              {!detection.isLoading &&
                !detection.error &&
                !detection.network &&
                url &&
                urlValidation.isValid && (
                  <p className="text-sm text-gray-500">
                    ノード情報の検出待ち...
                  </p>
                )}

              {!url && (
                <p className="text-sm text-gray-500">
                  URLを入力するとネットワーク情報を自動検出します
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="memo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              メモ（任意）
            </label>
            <input
              id="memo"
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="このノードの用途など"
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
              disabled={!canSubmit}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                canSubmit
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

// デバウンス関数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
