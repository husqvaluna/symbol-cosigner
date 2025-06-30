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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mobile-layout md:desktop-layout py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              署名待ちトランザクション
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  最終更新: {lastUpdated.toLocaleString("ja-JP")}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading || !canFetch}
                className="business-button primary"
              >
                {loading ? "読み込み中..." : "更新"}
              </button>
            </div>
          </div>

          {/* 現在の設定状況 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="business-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${activeAddress ? 'success' : 'warning'}`}>
                    {activeAddress ? '設定済み' : '未設定'}
                  </span>
                  <span className="text-sm font-medium">署名アドレス</span>
                </div>
                {activeAddress && (
                  <div className="text-xs font-mono text-gray-600 truncate ml-2 max-w-32">
                    {activeAddress.address.slice(0, 8)}...
                  </div>
                )}
              </div>
            </div>
            <div className="business-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${activeNode ? 'success' : 'warning'}`}>
                    {activeNode ? '接続中' : '未設定'}
                  </span>
                  <span className="text-sm font-medium">ノード</span>
                </div>
                {activeNode && (
                  <div className="text-xs text-gray-600">
                    {activeNode.network}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 business-card border-l-4 border-l-red-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="status-badge danger">エラー</span>
                  <span className="text-sm font-medium text-gray-700">
                    処理エラー
                  </span>
                </div>
                <div className="text-sm text-gray-600">{error}</div>
              </div>
              <button
                onClick={handleClearError}
                className="business-button secondary ml-3"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 必要な設定が不足している場合 */}
        {!canFetch && (
          <div className="business-card border-l-4 border-l-yellow-500 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="status-badge warning">要設定</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-2">
                  トランザクション一覧を取得するには以下の設定が必要です
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {missingRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0"></span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 統計情報 */}
        {canFetch && !loading && transactions.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="business-card text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">合計</div>
            </div>
            <div className="business-card text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.withCosignatures}
              </div>
              <div className="text-sm text-gray-600">連署あり</div>
            </div>
            <div className="business-card text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.withoutCosignatures}
              </div>
              <div className="text-sm text-gray-600">連署なし</div>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        {loading ? (
          <div className="business-card text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-500 text-lg">読み込み中...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="business-card text-center py-12">
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
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isAlreadySigned =
                getTransactionSigningStatus(transaction);
              return (
                <div key={transaction.id} className="business-card">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* ヘッダー */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {transaction.hash.substring(0, 12)}...
                        </h3>
                        <span className="status-badge neutral">
                          連署 {transaction.cosignatureCount}
                        </span>
                        {isAlreadySigned && (
                          <span className="status-badge success">
                            署名済み
                          </span>
                        )}
                      </div>

                      {/* 詳細情報 */}
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">ハッシュ:</span>
                          <div className="font-mono text-xs text-gray-900 mt-1 break-all">
                            {transaction.hash}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500">作成者:</span>
                            <div className="font-mono text-xs text-gray-900 mt-1 truncate">
                              {(transaction.signerAddress ||
                                transaction.signerPublicKey).substring(0, 16)}...
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">期限:</span>
                            <div className="text-xs text-gray-900 mt-1">
                              {formatDeadline(transaction.deadline)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 既存の連署者 */}
                      {transaction.cosignerAddresses.length > 0 && (
                        <div className="mt-4">
                          <span className="text-gray-500 text-sm">
                            連署者 ({transaction.cosignerAddresses.length}):
                          </span>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {transaction.cosignerAddresses.slice(0, 3).map(
                              (address, index) => (
                                <span
                                  key={index}
                                  className="font-mono text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {address.substring(0, 8)}...
                                </span>
                              ),
                            )}
                            {transaction.cosignerAddresses.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{transaction.cosignerAddresses.length - 3}件
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex-shrink-0">
                      <Link
                        to={`/pending/${transaction.hash}`}
                        className={`business-button ${
                          isAlreadySigned
                            ? "secondary"
                            : "success"
                        }`}
                      >
                        {isAlreadySigned ? "詳細確認" : "署名実行"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
