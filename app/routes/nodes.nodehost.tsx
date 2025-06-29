import type { Route } from "./+types/nodes.nodehost";
import { Navigation } from "../components/navigation";
import { useParams, Link } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `ノード詳細: ${params.nodehost} - Symbol Cosigner` },
    { name: "description", content: "ノードの詳細情報と管理" },
  ];
}

export default function NodeDetail() {
  const { nodehost } = useParams();

  const mockNodeData = {
    host: decodeURIComponent(nodehost || ""),
    name: "Opening Line Test 01",
    active: true,
    status: "online",
    network: "testnet",
    version: "1.0.3.4",
    height: "4,123,456",
    finalizedHeight: "4,123,400",
    lastCheck: "2024-01-15 14:30:00",
    responseTime: "125ms"
  };

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Link to="/nodes" className="text-blue-500 hover:text-blue-700 text-sm">
            ← ノード管理に戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">ノード詳細</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ホスト
                  </label>
                  <code className="block text-sm font-mono bg-gray-100 p-2 rounded">
                    {mockNodeData.host}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ノード名
                  </label>
                  <div className="text-sm">
                    {mockNodeData.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ネットワーク
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    mockNodeData.network === 'testnet'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {mockNodeData.network === 'testnet' ? 'テストネット' : 'メインネット'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状態
                  </label>
                  <div className="flex gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      mockNodeData.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mockNodeData.active ? '使用中' : '停止中'}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      mockNodeData.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mockNodeData.status === 'online' ? 'オンライン' : 'オフライン'}
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
                    {mockNodeData.version}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ブロック高
                  </label>
                  <div className="text-sm font-mono">
                    {mockNodeData.height}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    確定済み高
                  </label>
                  <div className="text-sm font-mono">
                    {mockNodeData.finalizedHeight}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    応答時間
                  </label>
                  <div className="text-sm">
                    {mockNodeData.responseTime}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最終確認
                  </label>
                  <div className="text-sm text-gray-600">
                    {mockNodeData.lastCheck}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">メモ</h2>
          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows={4}
            placeholder="このノードに関するメモを入力..."
            defaultValue="開発用のメインノード"
          />
          <div className="mt-3 flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              保存
            </button>
            <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors">
              キャンセル
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="flex gap-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              接続テスト
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              情報を更新
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
              {mockNodeData.active ? "使用停止" : "使用開始"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">危険な操作</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              このノードを削除すると、関連するすべてのデータが失われます。この操作は取り消しできません。
            </p>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
              ノードを削除
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
