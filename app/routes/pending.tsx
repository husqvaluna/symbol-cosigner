import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Navigation } from "../components/navigation";
import { activeAddressAtom } from "../store/addresses";
import { activeNodeAtom } from "../store/nodes";
import {
  canFetchTransactionsAtom,
  clearTransactionErrorAtom,
  fetchTransactionsAtom,
  hasAttemptedInitialFetchAtom,
  lastUpdatedAtom,
  missingRequirementsAtom,
  refreshTransactionsAtom,
  resetInitialFetchFlagAtom,
  transactionStatsAtom,
  transactionsAtom,
  transactionsErrorAtom,
  transactionsLoadingAtom,
} from "../store/transactions";
import type { Route } from "./+types/pending";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "トランザクション一覧 - Symbol Cosigner" },
    { name: "description", content: "署名が必要なトランザクション一覧" },
  ];
}

export default function Pending() {
  const transactions = useAtomValue(transactionsAtom);
  const loading = useAtomValue(transactionsLoadingAtom);
  const error = useAtomValue(transactionsErrorAtom);
  const lastUpdated = useAtomValue(lastUpdatedAtom);
  const stats = useAtomValue(transactionStatsAtom);
  const canFetch = useAtomValue(canFetchTransactionsAtom);
  const missingRequirements = useAtomValue(missingRequirementsAtom);
  const activeAddress = useAtomValue(activeAddressAtom);
  const activeNode = useAtomValue(activeNodeAtom);
  const hasAttemptedInitialFetch = useAtomValue(hasAttemptedInitialFetchAtom);

  const [, fetchTransactions] = useAtom(fetchTransactionsAtom);
  const [, refreshTransactions] = useAtom(refreshTransactionsAtom);
  const [, clearError] = useAtom(clearTransactionErrorAtom);
  const [, resetInitialFetchFlag] = useAtom(resetInitialFetchFlagAtom);

  // 初回データ取得
  useEffect(() => {
    if (
      canFetch &&
      !loading &&
      transactions.length === 0 &&
      !error &&
      !hasAttemptedInitialFetch
    ) {
      fetchTransactions();
    }
  }, [canFetch, loading, transactions.length, error, hasAttemptedInitialFetch]);

  // アドレスやノードが変更された場合はフラグをリセット
  useEffect(() => {
    resetInitialFetchFlag();
  }, [activeAddress, activeNode]);

  // リフレッシュハンドラ
  const handleRefresh = () => {
    refreshTransactions();
  };

  // エラークリアハンドラ
  const handleClearError = () => {
    clearError();
  };

  // 署名状態チェック関数
  const getTransactionSigningStatus = useMemo(() => {
    return (transaction: any) => {
      if (!activeAddress) return null;
      return transaction.cosignerAddresses.includes(activeAddress.address);
    };
  }, [activeAddress]);

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

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">トランザクション一覧</h1>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                最終更新: {lastUpdated.toLocaleString("ja-JP")}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading || !canFetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "読み込み中..." : "更新"}
            </button>
          </div>
        </div>

        {/* 選択状態の確認 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">選択中のアドレス:</span>
              <span className="ml-2 text-gray-600">
                {activeAddress ? activeAddress.address : "未選択"}
              </span>
            </div>
            <div>
              <span className="font-medium">選択中のノード:</span>
              <span className="ml-2 text-gray-600">
                {activeNode
                  ? `${activeNode.url} (${activeNode.network})`
                  : "未選択"}
              </span>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-800 font-medium">
                  エラーが発生しました
                </div>
                <div className="text-red-600 text-sm mt-1">{error}</div>
              </div>
              <button
                onClick={handleClearError}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 必要な設定が不足している場合 */}
        {!canFetch && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="text-yellow-800 font-medium mb-2">
              トランザクション一覧を取得するには以下の設定が必要です
            </div>
            <ul className="text-yellow-700 text-sm list-disc list-inside">
              {missingRequirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 統計情報 */}
        {canFetch && !loading && transactions.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">合計</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">連署あり</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.withCosignatures}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">連署なし</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.withoutCosignatures}
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">読み込み中...</div>
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-4">
                {canFetch
                  ? "署名が必要なトランザクションはありません"
                  : "アドレスとノードを選択してください"}
              </div>
              <div className="text-sm text-gray-400">
                {canFetch
                  ? "アグリゲートトランザクションが作成されると、ここに表示されます"
                  : "設定を行うとトランザクション一覧が表示されます"}
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((transaction) => {
                const isAlreadySigned =
                  getTransactionSigningStatus(transaction);
                return (
                  <div key={transaction.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-medium text-gray-900">
                            {transaction.hash.substring(0, 16)}...
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              連署: {transaction.cosignatureCount}
                            </span>
                            {isAlreadySigned && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                署名済み
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">
                              トランザクションハッシュ:
                            </span>
                            <div className="font-mono text-xs mt-1 break-all">
                              {transaction.hash}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">作成者:</span>
                            <div className="font-mono text-xs mt-1 break-all">
                              {transaction.signerAddress ||
                                transaction.signerPublicKey}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">期限:</span>
                            <div className="mt-1">
                              {formatDeadline(transaction.deadline)}
                            </div>
                          </div>
                        </div>

                        {transaction.cosignerAddresses.length > 0 && (
                          <div className="mt-4">
                            <span className="text-gray-500 text-sm">
                              既存の連署者:
                            </span>
                            <div className="mt-2 space-y-1">
                              {transaction.cosignerAddresses.map(
                                (address, index) => (
                                  <div
                                    key={index}
                                    className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded"
                                  >
                                    {address}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-6">
                        <Link
                          to={`/pending/${transaction.hash}`}
                          className={`inline-block px-4 py-2 text-white rounded-lg transition-colors ${
                            isAlreadySigned
                              ? "bg-gray-500 hover:bg-gray-600"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isAlreadySigned ? "詳細確認" : "詳細・署名"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
