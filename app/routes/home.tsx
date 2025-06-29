import type { Route } from "./+types/home";
import { Navigation } from "../components/navigation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Symbol Cosigner - ホーム" },
    { name: "description", content: "Symbol Cosigner アプリケーション" },
  ];
}

export default function Home() {
  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Symbol Cosigner</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">署名管理</h2>
            <div className="space-y-3">
              <a href="/waiting" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                <div className="font-medium">要求されている署名</div>
                <div className="text-sm text-gray-600">未署名のトランザクション一覧</div>
              </a>
              <a href="/pending" className="block p-3 bg-yellow-50 rounded hover:bg-yellow-100 transition-colors">
                <div className="font-medium">待機中の署名</div>
                <div className="text-sm text-gray-600">処理中のトランザクション一覧</div>
              </a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">設定管理</h2>
            <div className="space-y-3">
              <a href="/addresses" className="block p-3 bg-green-50 rounded hover:bg-green-100 transition-colors">
                <div className="font-medium">アドレス管理</div>
                <div className="text-sm text-gray-600">署名用アドレスの管理</div>
              </a>
              <a href="/nodes" className="block p-3 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                <div className="font-medium">ノード管理</div>
                <div className="text-sm text-gray-600">接続先ノードの管理</div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
