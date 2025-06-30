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

export function meta(_: Route.MetaArgs) {
  return [
    { title: "ノード管理 - Symbol Cosigner" },
    { name: "description", content: "接続先ノードの管理" },
  ];
}

export default function Nodes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodes] = useAtom(nodesAtom);
  const [currentNetwork] = useAtom(currentNetworkAtom);
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
  }, [nodes.length, initializePresetNodes]);

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mobile-layout md:desktop-layout py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                ノード管理
              </h1>
              <p className="text-sm text-gray-600">
                合計 {nodeStats.total} 件（アクティブ: {nodeStats.active}{" "}
                件、オンライン: {nodeStats.online} 件）
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="business-button primary"
              >
                ノード追加
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleNetworkSwitch("TESTNET")}
              className={`business-button ${
                currentNetwork === "TESTNET" ? "primary" : "secondary"
              }`}
            >
              テストネット ({nodeStats.testnet})
            </button>
            <button
              type="button"
              onClick={() => handleNetworkSwitch("MAINNET")}
              className={`business-button ${
                currentNetwork === "MAINNET" ? "primary" : "secondary"
              }`}
            >
              メインネット ({nodeStats.mainnet})
            </button>
          </div>
        </div>

        {currentNetworkNodes.length > 0 ? (
          <div className="space-y-4">
            {currentNetworkNodes.map((node) => (
              <div key={node.id} className="business-card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* ヘッダー */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {node.active && (
                        <span className="status-badge success">使用中</span>
                      )}
                      <span
                        className={`status-badge ${
                          node.status === "online"
                            ? "success"
                            : node.status === "offline"
                              ? "danger"
                              : "neutral"
                        }`}
                      >
                        {node.status === "online"
                          ? "オンライン"
                          : node.status === "offline"
                            ? "オフライン"
                            : "不明"}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {currentNetwork === "TESTNET"
                          ? "テストネット"
                          : "メインネット"}
                        ノード
                      </span>
                    </div>

                    {/* ノードURL */}
                    <div className="font-mono text-sm text-gray-900 mb-2 break-all">
                      {node.url.replace("https://", "")}
                    </div>

                    {/* メモ・ノード名 */}
                    {(node.memo || node.friendlyName) && (
                      <div className="text-sm text-gray-600 mb-2">
                        {node.memo || node.friendlyName}
                      </div>
                    )}

                    {/* 詳細情報 */}
                    <div className="text-xs text-gray-500 space-x-4">
                      {node.version && <span>バージョン: {node.version}</span>}
                      {node.responseTime && (
                        <span>応答時間: {node.responseTime}ms</span>
                      )}
                      {node.createdAt && (
                        <span>
                          作成: {new Date(node.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(node.id)}
                      className={`business-button ${
                        node.active ? "secondary" : "primary"
                      }`}
                    >
                      {node.active ? "使用停止" : "使用開始"}
                    </button>
                    <Link
                      to={`/nodes/${node.id}`}
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
              {currentNetwork}のノードが登録されていません
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="business-button primary"
            >
              最初のノードを追加
            </button>
          </div>
        )}

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
