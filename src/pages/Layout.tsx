import { Outlet } from "react-router-dom";
import Sidebar from "../components/custom/SideBar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1" style={{ padding: "1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
