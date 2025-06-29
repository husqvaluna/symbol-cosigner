import { Link } from "react-router";

export function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          Symbol Cosigner
        </Link>
        <div className="flex space-x-6">
          <Link 
            to="/waiting" 
            className="hover:text-gray-300 transition-colors"
          >
            要求署名一覧
          </Link>
          <Link 
            to="/pending" 
            className="hover:text-gray-300 transition-colors"
          >
            待機中署名
          </Link>
          <Link 
            to="/addresses" 
            className="hover:text-gray-300 transition-colors"
          >
            アドレス管理
          </Link>
          <Link 
            to="/nodes" 
            className="hover:text-gray-300 transition-colors"
          >
            ノード管理
          </Link>
        </div>
      </div>
    </nav>
  );
}