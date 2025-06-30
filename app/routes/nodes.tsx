import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { NodeModal } from "../components/NodeModal";
import { Navigation } from "../components/navigation";
import {
  addNodeAtom,
  currentNetworkAtom,
  filteredNodesAtom,
  initializePresetNodesAtom,
  nodeStatsAtom,
  nodesAtom,
  setActiveNodeAtom,
  switchNetworkAtom,
} from "../store/nodes";
import type { CreateNodeParams } from "../types/node";
import type { Route } from "./+types/nodes";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ノード管理 - Symbol Cosigner" },
    { name: "description", content: "接続先ノードの管理" },
  ];
}

export default function Nodes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes] = useAtom(nodesAtom);
  const [currentNetwork, setCurrentNetwork] = useAtom(currentNetworkAtom);
  const [filteredNodes] = useAtom(filteredNodesAtom);
  const [nodeStats] = useAtom(nodeStatsAtom);
  const [, addNode] = useAtom(addNodeAtom);
  const [, setActiveNode] = useAtom(setActiveNodeAtom);
  const [, switchNetwork] = useAtom(switchNetworkAtom);
  const [, initializePresetNodes] = useAtom(initializePresetNodesAtom);

  // プリセットノードの初期化（コンポーネントマウント時）
  useEffect(() => {
    if (nodes.length === 0) {
      initializePresetNodes();
    }
  }, [nodes.length]);

  // 現在のネットワークのノード一覧
  const currentNetworkNodes = filteredNodes.filter(
    (node) => node.network === currentNetwork,
  );

  // ノード追加処理
  const handleAddNode = (params: CreateNodeParams) => {
    try {
      addNode(params);
    } catch (error) {
      console.error("ノード追加エラー:", error);
      alert(
        error instanceof Error ? error.message : "ノードの追加に失敗しました",
      );
    }
  };

  // アクティブノード切り替え処理
  const handleToggleActive = (nodeId: string) => {
    try {
      setActiveNode(nodeId);
    } catch (error) {
      console.error("ノードアクティブ化エラー:", error);
      alert(
        error instanceof Error
          ? error.message
          : "ノードのアクティブ化に失敗しました",
      );
    }
  };

  // ネットワーク切り替え処理
  const handleNetworkSwitch = (network: "TESTNET" | "MAINNET") => {
    try {
      switchNetwork(network);
    } catch (error) {
      console.error("ネットワーク切り替えエラー:", error);
    }
  };

  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">ノード管理</h1>
            <p className="text-gray-600 mt-1">
              総ノード数: {nodeStats.total} / アクティブ: {nodeStats.active} /
              オンライン: {nodeStats.online}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            新しいノードを追加
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => handleNetworkSwitch("TESTNET")}
              className={`px-4 py-2 rounded transition-colors ${
                currentNetwork === "TESTNET"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              テストネット ({nodeStats.testnet})
            </button>
            <button
              onClick={() => handleNetworkSwitch("MAINNET")}
              className={`px-4 py-2 rounded transition-colors ${
                currentNetwork === "MAINNET"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              メインネット ({nodeStats.mainnet})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentNetwork === "TESTNET" ? "テストネット" : "メインネット"}{" "}
              ノード
            </h2>
            {currentNetworkNodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">
                  {currentNetwork}のノードが登録されていません
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  最初のノードを追加
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentNetworkNodes.map((node) => (
                  <div
                    key={node.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {node.url.replace("https://", "")}
                          </code>
                          {node.active && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              使用中
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              node.status === "online"
                                ? "bg-green-100 text-green-800"
                                : node.status === "offline"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {node.status === "online"
                              ? "オンライン"
                              : node.status === "offline"
                                ? "オフライン"
                                : "不明"}
                          </span>
                          {node.responseTime && (
                            <span className="text-xs text-gray-500">
                              {node.responseTime}ms
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {node.memo || node.friendlyName || "ノード情報なし"}
                        </div>
                        {node.version && (
                          <div className="text-xs text-gray-500 mt-1">
                            バージョン: {node.version}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(node.id)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          {node.active ? "使用停止" : "使用開始"}
                        </button>
                        <Link
                          to={`/nodes/${node.id}`}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          詳細
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ノード追加モーダル */}
        <NodeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddNode}
        />
      </main>
    </div>
  );
}
