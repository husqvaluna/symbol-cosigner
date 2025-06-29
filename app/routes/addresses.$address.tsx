import { useParams, Link, useNavigate } from "react-router";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import type { Route } from "./+types/addresses.$address";
import { Navigation } from "../components/navigation";
import {
  selectedAddressIdAtom,
  selectedAddressAtom,
  updateAddressAtom,
  removeAddressAtom,
} from "../store/addresses";

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

  // ローカル状態
  const [memo, setMemo] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // アドレスIDを設定し、メモを初期化
  useEffect(() => {
    if (address) {
      setSelectedAddressId(address);
    }
  }, [address, setSelectedAddressId]);

  // addressDataが変更されたときにメモを更新
  useEffect(() => {
    if (addressData) {
      setMemo(addressData.memo || "");
    }
  }, [addressData]);

  // アドレスが見つからない場合
  if (!address) {
    return (
      <div>
        <Navigation />
        <main className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              アドレスが指定されていません
            </div>
            <Link
              to="/addresses"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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
        <main className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              アドレスが見つかりません: {address}
            </div>
            <Link
              to="/addresses"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              アドレス管理に戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // メモ保存処理
  const handleSaveMemo = () => {
    try {
      updateAddress({
        address: addressData.address,
        memo: memo.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("メモ更新エラー:", error);
      alert(
        error instanceof Error ? error.message : "メモの更新に失敗しました",
      );
    }
  };

  // メモ編集キャンセル
  const handleCancelEdit = () => {
    setMemo(addressData.memo || "");
    setIsEditing(false);
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
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <Link
            to="/addresses"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
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
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      addressData.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">メモ</h2>
          {isEditing ? (
            <>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={4}
                placeholder="このアドレスに関するメモを入力..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSaveMemo}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full p-3 border rounded-lg bg-gray-50 min-h-[100px]">
                {addressData.memo || (
                  <span className="text-gray-500">
                    メモが設定されていません
                  </span>
                )}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  編集
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            危険な操作
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-3">
              このアドレスを削除すると、関連するすべてのデータが失われます。この操作は取り消しできません。
            </p>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              アドレスを削除
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
