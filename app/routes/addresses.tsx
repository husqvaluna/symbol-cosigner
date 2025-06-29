import type { Route } from "./+types/addresses";
import { Navigation } from "../components/navigation";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "アドレス管理 - Symbol Cosigner" },
    { name: "description", content: "署名用アドレスの管理" },
  ];
}

export default function Addresses() {
  const mockAddresses = [
    {
      address: "TCIFSMQZAX3IDPHUP2RTXP26N6BJRNKEBBKP33I",
      memo: "メインアドレス",
      active: true
    },
    {
      address: "TBMOSAICOD4F54EE5CDMR23CCBGOAM2XSJBR5OI",
      memo: "テスト用アドレス",
      active: false
    }
  ];

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">アドレス管理</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            新しいアドレスを追加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">登録済みアドレス</h2>
            <div className="space-y-4">
              {mockAddresses.map((addr) => (
                <div key={addr.address} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {addr.address}
                        </code>
                        {addr.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            使用中
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {addr.memo}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/addresses/${addr.address}`}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        詳細
                      </Link>
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors">
                        {addr.active ? "使用停止" : "使用開始"}
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