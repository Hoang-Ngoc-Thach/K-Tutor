import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe, HelpCircle, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      {/* Lớp ngoài: Trải dài 100% màn hình */}

      <div className="max-w-7xl w-full mx-auto px-6 py-4 flex items-center justify-between">
        {/* Lớp trong: Giới hạn chiều rộng và dàn đều nội dung */}

        {/* Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-emerald-800 text-white rounded-lg flex items-center justify-center font-bold text-lg">
            🎓
          </div>
          <span className="text-xl font-black text-emerald-900 tracking-tight">
            K-Tutor
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-emerald-700">
            Giới thiệu
          </a>
          <a href="#" className="hover:text-emerald-700">
            Học tập theo chủ đề
          </a>
          <a href="#" className="hover:text-emerald-700">
            TOPIK
          </a>
          <a href="#" className="hover:text-emerald-700">
            Cộng đồng
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600 shrink-0">
          <button className="flex items-center gap-1 hover:text-emerald-700">
            <Globe className="w-4 h-4" /> VIE
          </button>
          <button className="flex items-center gap-1 hover:text-emerald-700">
            <HelpCircle className="w-4 h-4" /> Trợ giúp
          </button>
          {user ? (
            <>
              <span className="hidden sm:inline max-w-[160px] truncate text-gray-500">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-emerald-900 hover:bg-emerald-950 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition whitespace-nowrap"
              >
                Đăng xuất <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="bg-emerald-900 hover:bg-emerald-950 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition whitespace-nowrap"
            >
              Đăng ký ngay <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
