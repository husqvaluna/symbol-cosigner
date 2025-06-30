import { useAtomValue } from "jotai";
import { Link } from "react-router";
import { Navigation } from "../components/navigation";
import { activeAddressAtom } from "../store/addresses";
import { activeNodeAtom } from "../store/nodes";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Symbol Cosigner - ホーム" },
    { name: "description", content: "Symbol Cosigner アプリケーション" },
  ];
}

export default function Home() {
  const activeAddress = useAtomValue(activeAddressAtom);
  const activeNode = useAtomValue(activeNodeAtom);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mobile-layout md:desktop-layout py-6">
        {/* ステータス概要 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Symbol Cosigner
          </h1>
          
          {/* 現在の設定状況 */}
          <div className="space-y-3">
            {activeAddress ? (
              <div className="business-card border-l-4 border-l-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="status-badge success">使用中</span>
                      <span className="text-sm font-medium text-gray-700">
                        アクティブアドレス
                      </span>
                    </div>
                    <div className="font-mono text-sm text-gray-900 truncate">
                      {activeAddress.address}
                    </div>
                    {activeAddress.memo && (
                      <div className="text-sm text-gray-600 mt-1">
                        {activeAddress.memo}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/addresses"
                    className="business-button secondary ml-3"
                  >
                    変更
                  </Link>
                </div>
              </div>
            ) : (
              <div className="business-card border-l-4 border-l-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="status-badge warning">未設定</span>
                      <span className="text-sm font-medium text-gray-700">
                        アクティブアドレス
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      署名用アドレスを設定してください
                    </div>
                  </div>
                  <Link to="/addresses" className="business-button warning">
                    設定
                  </Link>
                </div>
              </div>
            )}

            {activeNode ? (
              <div className="business-card border-l-4 border-l-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="status-badge success">接続中</span>
                      <span className="text-sm font-medium text-gray-700">
                        ネットワークノード
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 truncate">
                      {activeNode.url}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeNode.network}
                    </div>
                  </div>
                  <Link to="/nodes" className="business-button secondary ml-3">
                    変更
                  </Link>
                </div>
              </div>
            ) : (
              <div className="business-card border-l-4 border-l-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="status-badge warning">未設定</span>
                      <span className="text-sm font-medium text-gray-700">
                        ネットワークノード
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      接続先ノードを設定してください
                    </div>
                  </div>
                  <Link to="/nodes" className="business-button warning">
                    設定
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 主要機能 */}
        <div className="space-y-4 md:space-y-6">
          <div className="business-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">署名管理</h2>
              <Link to="/pending" className="business-button primary">
                一覧を見る
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-800 mb-1">3</div>
                <div className="text-sm text-yellow-700">署名待ち</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800 mb-1">12</div>
                <div className="text-sm text-green-700">完了済み</div>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/pending"
              className="business-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900">
                    トランザクション処理
                  </div>
                  <div className="text-sm text-gray-600">
                    署名待ちの取引を確認・処理
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/addresses"
              className="business-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="font-medium text-gray-900">
                    アカウント管理
                  </div>
                  <div className="text-sm text-gray-600">
                    署名用アドレスの登録・管理
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
