import type { Route } from "./+types/waiting";
import { Navigation } from "../components/navigation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "要求されている署名 - Symbol Cosigner" },
    { name: "description", content: "署名が必要なトランザクション一覧" },
  ];
}

export default function Waiting() {
  return (
    <div>
      <Navigation />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">要求されている署名</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              現在、署名が必要なトランザクションはありません
            </div>
            <div className="text-sm text-gray-400">
              アグリゲートトランザクションが作成されると、ここに表示されます
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
