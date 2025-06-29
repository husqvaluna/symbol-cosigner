import type { Route } from "./+types/addresses";
import { Navigation } from "../components/navigation";
import { AddressModal } from "../components/AddressModal";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAtom } from "jotai";
import {
  filteredAddressesAtom,
  addressStatsAtom,
  addAddressAtom,
  setActiveAddressAtom
} from "../store/addresses";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "アドレス管理 - Symbol Cosigner" },
    { name: "description", content: "署名用アドレスの管理" },
  ];
}

export default function Addresses() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [addresses] = useAtom(filteredAddressesAtom);
  const [stats] = useAtom(addressStatsAtom);
  const [, addAddress] = useAtom(addAddressAtom);
  const [, setActiveAddress] = useAtom(setActiveAddressAtom);

  // モーダルを開く
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // アドレス追加時の処理
  const handleAddAddress = (address: string, memo?: string) => {
    try {
      addAddress({ address, memo, active: false });
      // 正規化されたアドレスで画面遷移
      navigate(`/addresses/${address}`);
    } catch (error) {
      console.error('アドレス追加エラー:', error);
      // TODO: エラーハンドリング（トースト通知など）
      alert(error instanceof Error ? error.message : 'アドレスの追加に失敗しました');
    }
  };

  // アクティブ状態切り替え処理
  const handleToggleActive = (address: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        // 現在アクティブな場合は非アクティブにする（他のアドレスをアクティブにする必要がある）
        // ここでは簡単のため、何もしないか、確認ダイアログを表示する
        return;
      } else {
        // 非アクティブからアクティブにする
        setActiveAddress(address);
      }
    } catch (error) {
      console.error('アクティブ状態変更エラー:', error);
      alert(error instanceof Error ? error.message : 'アクティブ状態の変更に失敗しました');
    }
  };

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">アドレス管理</h1>
            <p className="text-gray-600 mt-1">
              合計 {stats.total} 件（アクティブ: {stats.active} 件）
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            新しいアドレスを追加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">登録済みアドレス</h2>
            <div className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
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
                          {addr.memo || 'メモなし'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          作成日: {new Date(addr.createdAt).toLocaleDateString()}
                          {addr.lastUsedAt && (
                            <span className="ml-3">
                              最終使用: {new Date(addr.lastUsedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/addresses/${addr.address}`}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          詳細
                        </Link>
                        <button
                          onClick={() => handleToggleActive(addr.address, addr.active)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                          disabled={addr.active} // アクティブなアドレスは停止不可（現時点では）
                        >
                          {addr.active ? "使用停止" : "使用開始"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    アドレスが登録されていません
                  </div>
                  <button
                    onClick={handleOpenModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    最初のアドレスを追加
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アドレス追加モーダル */}
        <AddressModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddAddress}
        />
      </main>
    </div>
  );
}
