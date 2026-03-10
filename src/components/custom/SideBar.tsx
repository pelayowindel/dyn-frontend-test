import { memo } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = memo(() => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">App</h1>
      </div>
      <nav className="text-sm space-y-2 px-4">
        <Link
          to="/"
          className={`block px-4 py-2 rounded-md transition ${
            isActive("/") ? "bg-blue-600" : "hover:bg-gray-800"
          }`}
        >
          Home
        </Link>
        <Link
          to="/recordings"
          className={` block px-4 py-2 rounded-md transition ${
            isActive("/recordings") ? "bg-blue-600" : "hover:bg-gray-800"
          }`}
        >
          Recordings
        </Link>
      </nav>
    </aside>
  );
});

export default Sidebar;
