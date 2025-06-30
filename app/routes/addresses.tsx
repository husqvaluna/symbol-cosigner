import { useAtom } from "jotai";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AddressModal } from "../components/AddressModal";
import { Navigation } from "../components/navigation";
import {
  addAddressAtom,
  addressStatsAtom,
  clearAllAddressesAtom,
  filteredAddressesAtom,
  setActiveAddressAtom,
} from "../store/addresses";
import type { Route } from "./+types/addresses";

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
  const [, clearAllAddresses] = useAtom(clearAllAddressesAtom);

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
      console.error("アドレス追加エラー:", error);
      // TODO: エラーハンドリング（トースト通知など）
      alert(
        error instanceof Error ? error.message : "アドレスの追加に失敗しました",
      );
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
      console.error("アクティブ状態変更エラー:", error);
      alert(
        error instanceof Error
          ? error.message
          : "アクティブ状態の変更に失敗しました",
      );
    }
  };

  // 全アドレスクリア処理
  const handleClearAllAddresses = () => {
    if (
      confirm(
        "全てのアドレスを削除しますか？この操作は元に戻せません。",
      )
    ) {
      try {
        clearAllAddresses();
      } catch (error) {
        console.error("アドレスクリアエラー:", error);
        alert(
          error instanceof Error
            ? error.message
            : "アドレスのクリアに失敗しました",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mobile-layout md:desktop-layout py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                アドレス管理
              </h1>
              <p className="text-sm text-gray-600">
                合計 {stats.total} 件（アクティブ: {stats.active} 件）
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
              <button
                onClick={handleOpenModal}
                className="business-button primary"
              >
                アドレス追加
              </button>
              {stats.total > 0 && (
                <button
                  onClick={handleClearAllAddresses}
                  className="business-button danger"
                >
                  全てクリア
                </button>
              )}
            </div>
          </div>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.address} className="business-card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* ヘッダー */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {addr.active && (
                        <span className="status-badge success">使用中</span>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        署名アドレス
                      </span>
                    </div>

                    {/* アドレス */}
                    <div className="font-mono text-sm text-gray-900 mb-2 break-all">
                      {addr.address}
                    </div>

                    {/* メモ */}
                    {addr.memo && (
                      <div className="text-sm text-gray-600 mb-2">
                        {addr.memo}
                      </div>
                    )}

                    {/* 日付情報 */}
                    <div className="text-xs text-gray-500 space-x-4">
                      <span>
                        作成: {new Date(addr.createdAt).toLocaleDateString()}
                      </span>
                      {addr.lastUsedAt && (
                        <span>
                          最終使用: {new Date(addr.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        handleToggleActive(addr.address, addr.active)
                      }
                      className={`business-button ${
                        addr.active ? "secondary" : "primary"
                      }`}
                      disabled={addr.active}
                    >
                      {addr.active ? "使用停止" : "使用開始"}
                    </button>
                    <Link
                      to={`/addresses/${addr.address}`}
                      className="business-button secondary"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="business-card text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              アドレスが登録されていません
            </div>
            <button
              onClick={handleOpenModal}
              className="business-button primary"
            >
              最初のアドレスを追加
            </button>
          </div>
        )}

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
