import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import Footer from "./Footer";
import { USER_NAV_ITEMS } from "./navItems";

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const title =
    USER_NAV_ITEMS.find((item) => item.to === pathname)?.label ?? "K-Tutor";

  return (
    <div className="min-h-screen flex bg-gray-50">
      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <UserHeader title={title} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
