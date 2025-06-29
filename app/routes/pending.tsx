import type { Route } from "./+types/pending";
import { Navigation } from "../components/navigation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "待機中の署名 - Symbol Cosigner" },
    { name: "description", content: "処理中のトランザクション一覧" },
  ];
}

export default function Pending() {
  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">待機中の署名</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              現在、処理中のトランザクションはありません
            </div>
            <div className="text-sm text-gray-400">
              署名処理中のトランザクションがここに表示されます
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
