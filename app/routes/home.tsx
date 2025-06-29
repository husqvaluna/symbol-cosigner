import { useAtomValue } from "jotai";
import { Navigation } from "../components/navigation";
import { activeAddressAtom } from "../store/addresses";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Symbol Cosigner - ホーム" },
    { name: "description", content: "Symbol Cosigner アプリケーション" },
  ];
}

export default function Home() {
  const activeAddress = useAtomValue(activeAddressAtom);

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Symbol Cosigner</h1>
          {activeAddress ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800">
                  現在設定中のアドレス:
                </span>
                <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono text-blue-900">
                  {activeAddress.address}
                </code>
              </div>
              {activeAddress.memo && (
                <div className="mt-2 text-sm text-blue-700">
                  メモ: {activeAddress.memo}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-yellow-800">
                  アクティブなアドレスが設定されていません
                </span>
                <a
                  href="/addresses"
                  className="text-sm text-yellow-700 underline hover:text-yellow-900"
                >
                  アドレス管理画面で設定
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">署名管理</h2>
            <div className="space-y-3">
              <a
                href="/pending"
                className="block p-3 bg-yellow-50 rounded hover:bg-yellow-100 transition-colors"
              >
                <div className="font-medium">待機中の署名</div>
                <div className="text-sm text-gray-600">
                  処理中のトランザクション一覧
                </div>
              </a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">設定管理</h2>
            <div className="space-y-3">
              <a
                href="/addresses"
                className="block p-3 bg-green-50 rounded hover:bg-green-100 transition-colors"
              >
                <div className="font-medium">アドレス管理</div>
                <div className="text-sm text-gray-600">
                  署名用アドレスの管理
                </div>
              </a>
              <a
                href="/nodes"
                className="block p-3 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
              >
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
