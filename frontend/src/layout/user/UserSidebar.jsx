import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, LogIn, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { USER_NAV_ITEMS } from "./navItems";

const getNavClass = ({ isActive }) =>
  isActive
    ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-sm"
    : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition";

export default function UserSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* Lớp phủ khi mở sidebar trên màn hình nhỏ */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-gray-100 p-4 flex flex-col justify-between transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <NavLink
              to="/"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-emerald-800 text-white rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-emerald-900 tracking-tight">
                K-Tutor
              </span>
            </NavLink>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {USER_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={getNavClass}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-emerald-700" : "text-gray-400"
                      }`}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Tài khoản */}
        {user ? (
          <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between gap-2 border border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 shrink-0 bg-emerald-800 text-white font-bold text-xs rounded-full flex items-center justify-center">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-700 truncate">
                {user.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/auth");
            }}
            className="bg-emerald-900 hover:bg-emerald-950 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập / Đăng ký
          </button>
        )}
      </aside>
    </>
  );
}
