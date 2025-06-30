import { useAtom } from "jotai";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { MemoEditor } from "../components/MemoEditor";
import { Navigation } from "../components/navigation";
import {
  removeAddressAtom,
  selectedAddressAtom,
  selectedAddressIdAtom,
  updateAddressAtom,
} from "../store/addresses";
import type { Route } from "./+types/addresses.$address";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `アドレス詳細: ${params.address} - Symbol Cosigner` },
    { name: "description", content: "アドレスの詳細情報と管理" },
  ];
}

export default function AddressDetail() {
  const { address } = useParams();
  const navigate = useNavigate();

  // Jotai atoms
  const [addressData] = useAtom(selectedAddressAtom);
  const [, setSelectedAddressId] = useAtom(selectedAddressIdAtom);
  const [, updateAddress] = useAtom(updateAddressAtom);
  const [, removeAddress] = useAtom(removeAddressAtom);


  // アドレスIDを設定
  useEffect(() => {
    if (address) {
      setSelectedAddressId(address);
    }
  }, [address, setSelectedAddressId]);

  // アドレスが見つからない場合
  if (!address) {
    return (
      <div>
        <Navigation />
        <main className="mobile-layout md:desktop-layout">
          <div className="text-center py-12">
            <div className="text-center mb-4">
              <span className="status-badge danger text-lg">
                アドレスが指定されていません
              </span>
            </div>
            <Link
              to="/addresses"
              className="business-button"
            >
              アドレス管理に戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!addressData) {
    return (
      <div>
        <Navigation />
        <main className="mobile-layout md:desktop-layout">
          <div className="text-center py-12">
            <div className="text-center mb-4">
              <span className="status-badge danger text-lg">
                アドレスが見つかりません: {address}
              </span>
            </div>
            <Link
              to="/addresses"
              className="business-button"
            >
              アドレス管理に戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // メモ保存処理
  const handleSaveMemo = async (memo: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        updateAddress({
          address: addressData!.address,
          memo,
        });
        resolve();
      } catch (error) {
        console.error("メモ更新エラー:", error);
        reject(error);
      }
    });
  };

  // アドレス削除処理
  const handleDelete = () => {
    if (
      !confirm(
        `アドレス ${addressData.address} を削除しますか？\nこの操作は取り消しできません。`,
      )
    ) {
      return;
    }

    try {
      removeAddress(addressData.address);
      navigate("/addresses");
    } catch (error) {
      console.error("アドレス削除エラー:", error);
      alert(
        error instanceof Error ? error.message : "アドレスの削除に失敗しました",
      );
    }
  };

  return (
    <div>
      <Navigation />
      <main className="mobile-layout md:desktop-layout">
        <div className="mb-6">
          <Link
            to="/addresses"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← アドレス管理に戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">アドレス詳細</h1>

        <div className="business-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アドレス
                  </label>
                  <code className="block text-sm font-mono bg-gray-100 p-2 rounded">
                    {addressData.address}
                  </code>
                </div>
                {addressData.publicKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      公開鍵
                    </label>
                    <code className="block text-sm font-mono bg-gray-100 p-2 rounded">
                      {addressData.publicKey}
                    </code>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状態
                  </label>
                  <span
                    className={`status-badge ${
                      addressData.active
                        ? "status-badge--success"
                        : "status-badge--inactive"
                    }`}
                  >
                    {addressData.active ? "使用中" : "停止中"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    作成日時
                  </label>
                  <div className="text-sm">
                    {new Date(addressData.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
              <div className="space-y-3">
                {addressData.balance ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      残高 (XYM)
                    </label>
                    <div className="text-lg font-mono">
                      {addressData.balance}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      残高 (XYM)
                    </label>
                    <div className="text-sm text-gray-500">未取得</div>
                  </div>
                )}
                {addressData.lastUsedAt ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最終使用
                    </label>
                    <div className="text-sm text-gray-600">
                      {new Date(addressData.lastUsedAt).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最終使用
                    </label>
                    <div className="text-sm text-gray-500">未使用</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <MemoEditor
          initialMemo={addressData.memo || ""}
          onSave={handleSaveMemo}
          placeholder="このアドレスに関するメモを入力..."
        />

        <div className="business-card">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            危険な操作
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              このアドレスを削除すると、関連するすべてのデータが失われます。この操作は取り消しできません。
            </p>
            <button
              onClick={handleDelete}
              className="business-button danger"
            >
              アドレスを削除
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
