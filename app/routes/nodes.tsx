import type { Route } from "./+types/nodes";
import { Navigation } from "../components/navigation";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ノード管理 - Symbol Cosigner" },
    { name: "description", content: "接続先ノードの管理" },
  ];
}

export default function Nodes() {
  const mockNodes = {
    testnet: [
      {
        host: "sym-test-01.opening-line.jp:3001",
        name: "Opening Line Test 01",
        active: true,
        status: "online"
      },
      {
        host: "sym-test-03.opening-line.jp:3001", 
        name: "Opening Line Test 03",
        active: false,
        status: "online"
      }
    ],
    mainnet: [
      {
        host: "sym-main-01.opening-line.jp:3001",
        name: "Opening Line Main 01", 
        active: false,
        status: "online"
      },
      {
        host: "pasomi.net:3001",
        name: "Pasomi Node",
        active: false,
        status: "offline"
      }
    ]
  };

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ノード管理</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            新しいノードを追加
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              テストネット
            </button>
            <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors">
              メインネット
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">テストネット ノード</h2>
            <div className="space-y-4">
              {mockNodes.testnet.map((node) => (
                <div key={node.host} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {node.host}
                        </code>
                        {node.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            使用中
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          node.status === 'online' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {node.status === 'online' ? 'オンライン' : 'オフライン'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {node.name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/nodes/${encodeURIComponent(node.host)}`}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        詳細
                      </Link>
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                        {node.active ? "使用停止" : "使用開始"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">メインネット ノード</h2>
            <div className="space-y-4">
              {mockNodes.mainnet.map((node) => (
                <div key={node.host} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {node.host}
                        </code>
                        {node.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            使用中
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          node.status === 'online' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {node.status === 'online' ? 'オンライン' : 'オフライン'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {node.name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/nodes/${encodeURIComponent(node.host)}`}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        詳細
                      </Link>
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                        {node.active ? "使用停止" : "使用開始"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}