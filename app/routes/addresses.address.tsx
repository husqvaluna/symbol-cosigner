import type { Route } from "./+types/addresses.address";
import { Navigation } from "../components/navigation";
import { useParams, Link } from "react-router";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `アドレス詳細: ${params.address} - Symbol Cosigner` },
    { name: "description", content: "アドレスの詳細情報と管理" },
  ];
}

export default function AddressDetail() {
  const { address } = useParams();
  
  const mockAddressData = {
    address: address,
    publicKey: "9A49366406ACA952B88BADF5F1E9BE6CE4968141035A60BE503273EA65456B24",
    memo: "メインアドレス",
    active: true,
    balance: "1,234.567890",
    lastActivity: "2024-01-15 14:30:00"
  };

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Link to="/addresses" className="text-blue-500 hover:text-blue-700 text-sm">
            ← アドレス管理に戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">アドレス詳細</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アドレス
                  </label>
                  <code className="block text-sm font-mono bg-gray-100 p-2 rounded">
                    {mockAddressData.address}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公開鍵
                  </label>
                  <code className="block text-sm font-mono bg-gray-100 p-2 rounded">
                    {mockAddressData.publicKey}
                  </code>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状態
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    mockAddressData.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mockAddressData.active ? '使用中' : '停止中'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    残高 (XYM)
                  </label>
                  <div className="text-lg font-mono">
                    {mockAddressData.balance}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最終活動
                  </label>
                  <div className="text-sm text-gray-600">
                    {mockAddressData.lastActivity}
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
            placeholder="このアドレスに関するメモを入力..."
            defaultValue={mockAddressData.memo}
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

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">危険な操作</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              このアドレスを削除すると、関連するすべてのデータが失われます。この操作は取り消しできません。
            </p>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
              アドレスを削除
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}