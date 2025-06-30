import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { MemoEditor } from "../components/MemoEditor";
import { Navigation } from "../components/navigation";
import {
  nodesAtom,
  performNodeHealthCheckAtom,
  removeNodeAtom,
  setActiveNodeAtom,
  updateNodeAtom,
} from "../store/nodes";

export function meta({ params }: any) {
  return [
    { title: `ノード詳細: ${params.id} - Symbol Cosigner` },
    { name: "description", content: "ノードの詳細情報と管理" },
  ];
}

export default function NodeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes] = useAtom(nodesAtom);
  const [, updateNode] = useAtom(updateNodeAtom);
  const [, removeNode] = useAtom(removeNodeAtom);
  const [, setActiveNode] = useAtom(setActiveNodeAtom);
  const [, performHealthCheck] = useAtom(performNodeHealthCheckAtom);

  // 状態管理
  const [error, setError] = useState<string | null>(null);
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  // ノードデータを取得
  const node = nodes.find((n) => n.id === id);

  // ノードが見つからない場合のエラーハンドリング
  useEffect(() => {
    if (!id) {
      setError("ノードIDが指定されていません");
      return;
    }
    if (nodes.length > 0 && !node) {
      setError("指定されたノードが見つかりません");
    }
  }, [id, node, nodes.length]);

  // エラーリセット
  useEffect(() => {
    if (node) {
      setError(null);
    }
  }, [node]);

  // エラー状態またはノードが見つからない場合の表示
  if (error || !node) {
    return (
      <div>
        <Navigation />
        <main className="mobile-layout md:desktop-layout">
          <div className="mb-6">
            <Link
              to="/nodes"
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              ← ノード管理に戻る
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <span className="status-badge danger text-lg">
                エラーが発生しました
              </span>
            </div>
            <p className="text-red-700 mb-4">
              {error || "ノードデータを読み込めませんでした"}
            </p>
            <Link
              to="/nodes"
              className="business-button"
            >
              ノード管理に戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // メモ保存機能
  const handleSaveMemo = async (memo: string) => {
    await updateNode({
      id: id!,
      memo,
    });
  };

  // ヘルスチェック機能
  const handleHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      await performHealthCheck(id!);
      alert("接続テストが完了しました");
    } catch (error) {
      console.error("ヘルスチェックエラー:", error);
      alert(
        error instanceof Error ? error.message : "接続テストに失敗しました",
      );
    } finally {
      setIsHealthChecking(false);
    }
  };

  // 情報更新機能（ヘルスチェックと同じ）
  const handleRefreshInfo = () => {
    handleHealthCheck();
  };

  // アクティブ状態切り替え機能
  const handleToggleActive = async () => {
    try {
      await setActiveNode(id!);
      alert(
        node.active ? "ノードを使用停止しました" : "ノードを使用開始しました",
      );
    } catch (error) {
      console.error("アクティブ状態切り替えエラー:", error);
      alert(
        error instanceof Error
          ? error.message
          : "ノードの状態切り替えに失敗しました",
      );
    }
  };

  // ノード削除機能
  const handleDeleteNode = () => {
    const confirmed = window.confirm(
      `ノード「${node.url}」を削除してもよろしいですか？\n\nこの操作は取り消しできません。`,
    );

    if (confirmed) {
      try {
        removeNode(id!);
        alert("ノードを削除しました");
        navigate("/nodes");
      } catch (error) {
        console.error("ノード削除エラー:", error);
        alert(
          error instanceof Error ? error.message : "ノードの削除に失敗しました",
        );
      }
    }
  };

  // ネットワーク名の表示用関数
  const getNetworkDisplayName = (network: string) => {
    return network === "TESTNET" ? "テストネット" : "メインネット";
  };

  // ステータス表示用関数
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "online":
        return "オンライン";
      case "offline":
        return "オフライン";
      default:
        return "不明";
    }
  };

  // 応答時間の表示用関数
  const formatResponseTime = (responseTime?: number) => {
    return responseTime ? `${responseTime}ms` : "不明";
  };

  // 最終確認時刻の表示用関数
  const formatLastChecked = (lastCheckedAt?: string) => {
    if (!lastCheckedAt) return "未確認";
    try {
      return new Date(lastCheckedAt).toLocaleString("ja-JP");
    } catch {
      return "不明";
    }
  };

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Link
            to="/nodes"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← ノード管理に戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">ノード詳細</h1>

        <div className="business-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ホスト
                  </label>
                  <code className="block text-sm font-mono bg-gray-100 p-2 rounded">
                    {node.url.replace("https://", "")}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ノード名
                  </label>
                  <div className="text-sm">
                    {node.friendlyName || node.memo || "不明"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ネットワーク
                  </label>
                  <span
                    className={`status-badge ${
                      node.network === "TESTNET"
                        ? "status-badge--info"
                        : "status-badge--primary"
                    }`}
                  >
                    {getNetworkDisplayName(node.network)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状態
                  </label>
                  <div className="flex gap-2">
                    <span
                      className={`status-badge ${
                        node.active
                          ? "status-badge--success"
                          : "status-badge--inactive"
                      }`}
                    >
                      {node.active ? "使用中" : "停止中"}
                    </span>
                    <span
                      className={`status-badge ${
                        node.status === "online"
                          ? "status-badge--success"
                          : node.status === "offline"
                            ? "status-badge--error"
                            : "status-badge--inactive"
                      }`}
                    >
                      {getStatusDisplayName(node.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">ノード情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    バージョン
                  </label>
                  <div className="text-sm font-mono">
                    {node.version || "不明"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ノードID
                  </label>
                  <div className="text-sm font-mono text-gray-600 break-all">
                    {node.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ネットワーク識別子
                  </label>
                  <div className="text-sm font-mono">
                    {node.networkIdentifier || "不明"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    応答時間
                  </label>
                  <div className="text-sm">
                    {formatResponseTime(node.responseTime)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最終確認
                  </label>
                  <div className="text-sm text-gray-600">
                    {formatLastChecked(node.lastCheckedAt)}
                  </div>
                </div>
                {node.publicKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      公開鍵
                    </label>
                    <div className="text-xs font-mono text-gray-600 break-all">
                      {node.publicKey}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <MemoEditor
          initialMemo={node.memo || ""}
          onSave={handleSaveMemo}
          placeholder="このノードに関するメモを入力..."
        />

        <div className="business-card mb-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleHealthCheck}
              disabled={isHealthChecking}
              className={`business-button ${
                isHealthChecking
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isHealthChecking ? "接続中..." : "接続テスト"}
            </button>
            <button
              onClick={handleRefreshInfo}
              disabled={isHealthChecking}
              className={`business-button success ${
                isHealthChecking
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isHealthChecking ? "更新中..." : "情報を更新"}
            </button>
            <button
              onClick={handleToggleActive}
              className="business-button warning"
            >
              {node.active ? "使用停止" : "使用開始"}
            </button>
          </div>
        </div>

        <div className="business-card">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            危険な操作
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              このノードを削除すると、関連するすべてのデータが失われます。この操作は取り消しできません。
            </p>
            <button
              onClick={handleDeleteNode}
              className="business-button danger"
            >
              ノードを削除
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
