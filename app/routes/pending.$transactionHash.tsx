/**
 * トランザクション詳細ページ
 *
 * 設計方針:
 * - 指定されたハッシュのトランザクション詳細を表示
 * - 署名ボタンで秘密鍵入力モーダルを表示
 * - 既存のUIパターンとJotai使用パターンに準拠
 *
 * 関連ファイル:
 * - app/store/transactions.ts
 * - app/components/PrivateKeyModal.tsx
 * - app/routes/pending.tsx
 */

import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Navigation } from "../components/navigation";
import { PrivateKeyModal } from "../components/PrivateKeyModal";
import { activeAddressAtom } from "../store/addresses";
import {
  getSigningCompletedEventAtom,
  signingStateAtom,
} from "../store/signing";
import { transactionsAtom } from "../store/transactions";
import type { Route } from "./+types/pending.$transactionHash";

export function meta({ params }: Route.MetaArgs) {
  return [
    {
      title: `トランザクション詳細 - ${params.transactionHash?.substring(0, 16)}... - Symbol Cosigner`,
    },
    { name: "description", content: "トランザクション詳細と署名機能" },
  ];
}

export default function TransactionDetail() {
  const { transactionHash } = useParams();
  const transactions = useAtomValue(transactionsAtom);
  const signingState = useAtomValue(signingStateAtom);
  const signingCompletedEvent = useAtomValue(getSigningCompletedEventAtom);
  const activeAddress = useAtomValue(activeAddressAtom);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [hasSignedThisTransaction, setHasSignedThisTransaction] =
    useState(false);

  // 指定されたハッシュのトランザクションを検索
  const transaction = transactions.find((tx) => tx.hash === transactionHash);

  // アクティブアドレスが既存の連署者に含まれているかチェック
  const isAlreadyCosigned = useMemo(() => {
    if (!activeAddress || !transaction) return false;
    return transaction.cosignerAddresses.includes(activeAddress.address);
  }, [activeAddress, transaction]);

  // 署名完了イベントの監視
  useEffect(() => {
    if (
      signingCompletedEvent &&
      signingCompletedEvent.transactionHash === transactionHash &&
      signingCompletedEvent.success
    ) {
      setHasSignedThisTransaction(true);
    }
  }, [signingCompletedEvent, transactionHash]);

  // トランザクション期限の表示形式変換
  const formatDeadline = (deadline: string) => {
    try {
      // Symbol の deadline は Nemesis Block からのミリ秒数
      const nemesisTimestamp = 1615852585000;
      const deadlineMs = Number(deadline);
      const date = new Date(nemesisTimestamp + deadlineMs);
      return date.toLocaleString("ja-JP");
    } catch {
      return deadline;
    }
  };

  // 署名ボタンクリックハンドラ
  const handleSignClick = () => {
    setShowPrivateKeyModal(true);
  };

  // 署名状態の判定
  const getSigningStatus = () => {
    // 最優先: 既存連署者チェック
    if (isAlreadyCosigned) {
      return {
        status: "already_signed",
        message: "このアドレスは既に署名済みです",
        color: "green",
      };
    }

    if (hasSignedThisTransaction) {
      return {
        status: "signed",
        message: "このトランザクションに署名済みです",
        color: "green",
      };
    }

    if (signingState.transactionHash === transactionHash) {
      switch (signingState.status) {
        case "signing":
          return {
            status: "signing",
            message: "署名を作成中...",
            color: "blue",
          };
        case "announcing":
          return {
            status: "announcing",
            message: "ネットワークにアナウンス中...",
            color: "blue",
          };
        case "success":
          return {
            status: "success",
            message: "署名とアナウンスが完了しました",
            color: "green",
          };
        case "error":
          return {
            status: "error",
            message: signingState.error || "署名処理でエラーが発生しました",
            color: "red",
          };
      }
    }

    return {
      status: "pending",
      message: "このトランザクションにはあなたの署名が必要です",
      color: "yellow",
    };
  };

  const currentStatus = getSigningStatus();

  if (!transaction) {
    return (
      <div>
        <Navigation />
        <main className="mobile-layout md:desktop-layout">
          <div className="mb-6">
            <Link
              to="/pending"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← トランザクション一覧に戻る
            </Link>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="mb-2">
              <span className="status-badge danger">
                トランザクションが見つかりません
              </span>
            </div>
            <div className="text-red-600 text-sm">
              指定されたハッシュ「{transactionHash}
              」のトランザクションが存在しないか、読み込まれていません。
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Link
            to="/pending"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← トランザクション一覧に戻る
          </Link>
        </div>

        <div className="business-card">
          {/* ヘッダー部分 */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  トランザクション詳細
                </h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    連署数: {transaction.cosignatureCount}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignClick}
                disabled={
                  isAlreadyCosigned ||
                  currentStatus.status === "signing" ||
                  currentStatus.status === "announcing"
                }
                className={`business-button ${
                  isAlreadyCosigned
                    ? "secondary cursor-not-allowed"
                    : currentStatus.status === "signing" ||
                        currentStatus.status === "announcing"
                      ? "primary cursor-not-allowed"
                      : "success"
                }`}
              >
                {isAlreadyCosigned
                  ? "署名済み"
                  : currentStatus.status === "signing" ||
                      currentStatus.status === "announcing"
                    ? "処理中..."
                    : "署名する"}
              </button>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              基本情報
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  トランザクションハッシュ
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {transaction.hash}
                  </code>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  作成者
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {transaction.signerAddress || transaction.signerPublicKey}
                  </code>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  期限
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">
                    {formatDeadline(transaction.deadline)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 既存の連署者情報 */}
          {transaction.cosignerAddresses.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                既存の連署者 ({transaction.cosignerAddresses.length}名)
              </h2>
              <div className="space-y-3">
                {transaction.cosignerAddresses.map((address, index) => {
                  const isCurrentAddress = activeAddress?.address === address;
                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        isCurrentAddress
                          ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrentAddress ? "bg-blue-500" : "bg-green-500"
                          }`}
                        ></div>
                        <code
                          className={`text-sm font-mono break-all ${
                            isCurrentAddress
                              ? "text-blue-800 font-semibold"
                              : "text-green-800"
                          }`}
                        >
                          {address}
                        </code>
                        {isCurrentAddress && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            選択中
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 署名状態 */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              署名状態
            </h2>
            <div
              className={`border rounded-lg p-4 ${
                currentStatus.color === "green"
                  ? "bg-green-50 border-green-200"
                  : currentStatus.color === "blue"
                    ? "bg-blue-50 border-blue-200"
                    : currentStatus.color === "red"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {currentStatus.status === "signing" ||
                currentStatus.status === "announcing" ? (
                  <div
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      currentStatus.color === "blue"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                ) : currentStatus.status === "signed" ||
                  currentStatus.status === "success" ? (
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : currentStatus.status === "error" ? (
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
                <div>
                  <div
                    className={`font-medium ${
                      currentStatus.color === "green"
                        ? "text-green-800"
                        : currentStatus.color === "blue"
                          ? "text-blue-800"
                          : currentStatus.color === "red"
                            ? "text-red-800"
                            : "text-yellow-800"
                    }`}
                  >
                    {currentStatus.status === "signed" ||
                    currentStatus.status === "success"
                      ? "署名完了"
                      : currentStatus.status === "signing"
                        ? "署名中"
                        : currentStatus.status === "announcing"
                          ? "アナウンス中"
                          : currentStatus.status === "error"
                            ? "エラー"
                            : "署名待機中"}
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      currentStatus.color === "green"
                        ? "text-green-700"
                        : currentStatus.color === "blue"
                          ? "text-blue-700"
                          : currentStatus.color === "red"
                            ? "text-red-700"
                            : "text-yellow-700"
                    }`}
                  >
                    {currentStatus.message}
                    {currentStatus.status === "pending" &&
                      " 上の「署名する」ボタンをクリックして署名を行ってください。"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 秘密鍵入力モーダル */}
      {showPrivateKeyModal && (
        <PrivateKeyModal
          isOpen={showPrivateKeyModal}
          onClose={() => setShowPrivateKeyModal(false)}
          transactionHash={transaction.hash}
        />
      )}
    </div>
  );
}
