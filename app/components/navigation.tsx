import { Link, useLocation } from "react-router";

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* デスクトップナビゲーション */}
      <nav className="hidden md:block bg-gray-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold hover:text-gray-300">
            Symbol Cosigner
          </Link>
          <div className="flex space-x-6">
            <Link to="/pending" className="hover:text-gray-300 transition-colors">
              トランザクション一覧
            </Link>
            <Link
              to="/addresses"
              className="hover:text-gray-300 transition-colors"
            >
              アドレス管理
            </Link>
            <Link to="/nodes" className="hover:text-gray-300 transition-colors">
              ノード管理
            </Link>
          </div>
        </div>
      </nav>

      {/* モバイルタブバー */}
      <nav className="tab-bar md:hidden">
        <div className="grid grid-cols-4 h-full">
          <Link
            to="/"
            className={`tab-item ${isActive("/") ? "active" : ""}`}
          >
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            <span>ホーム</span>
          </Link>
          
          <Link
            to="/pending"
            className={`tab-item ${isActive("/pending") ? "active" : ""}`}
          >
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>署名待ち</span>
          </Link>
          
          <Link
            to="/addresses"
            className={`tab-item ${isActive("/addresses") ? "active" : ""}`}
          >
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
            </svg>
            <span>アドレス</span>
          </Link>
          
          <Link
            to="/nodes"
            className={`tab-item ${isActive("/nodes") ? "active" : ""}`}
          >
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
            </svg>
            <span>ノード</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
