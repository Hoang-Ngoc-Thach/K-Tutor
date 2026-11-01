import React, { useEffect, useRef, useState } from "react";

import AdminSidebar from "../../layout/admin/AdminSidebar";

import UserSummaryCards from "../../components/admin/UserSummaryCards";
import UserDetailModal from "../../components/admin/UserDetailModal";
import UserActionModal from "../../components/admin/UserActionModal";

import {
  getGoalLabel,
  getUserErrorMessage,
  getUsersRequest,
  GOAL_LABELS,
  setUserLockedRequest,
} from "../../api/users";

import {
  Search,
  MoreVertical,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

function StatusBadge({ locked }) {
  if (locked) {
    return (
      <span className="inline-flex items-center rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
        Đã khóa
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
      Hoạt động
    </span>
  );
}

function GoalBadge({ goal }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700">
      {getGoalLabel(goal)}
    </span>
  );
}

function UserActionMenu({ user, isOpen, onToggle, onView, onLock, onUnlock }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleMenuAction = (action) => {
    onToggle(null);

    if (action === "view") {
      onView(user);
      return;
    }

    if (action === "lock") {
      onLock(user);
      return;
    }

    if (action === "unlock") {
      onUnlock(user);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => onToggle(isOpen ? null : user.id)}
        className={`rounded-lg p-2 transition ${
          isOpen
            ? "bg-gray-100 text-gray-700"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        }`}
        title="Thao tác"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleMenuAction("view")}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
          >
            Xem chi tiết
          </button>

          {!user.locked ? (
            <button
              type="button"
              onClick={() => handleMenuAction("lock")}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-red-600 transition hover:bg-red-50"
            >
              <Lock className="h-3.5 w-3.5" />
              Khóa tài khoản
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleMenuAction("unlock")}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-emerald-700 transition hover:bg-emerald-50"
            >
              <Unlock className="h-3.5 w-3.5" />
              Mở khóa
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  const [summary, setSummary] = useState({ total: 0, active: 0, locked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [goalFilter, setGoalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  // Tăng reloadKey để tải lại danh sách sau khi khóa / mở khóa.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadUsers = () => setReloadKey((key) => key + 1);

  // Chờ người dùng ngừng gõ rồi mới gửi từ khóa lên backend.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    getUsersRequest({
      current: page,
      pageSize: PAGE_SIZE,
      search: searchTerm,
      goal: goalFilter === "all" ? undefined : goalFilter,
      locked: statusFilter === "all" ? undefined : statusFilter === "locked",
    })
      .then((data) => {
        if (cancelled) return;

        // Trang hiện tại không còn dữ liệu (vừa khóa người cuối cùng của bộ lọc).
        if (data.items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }

        setUsers(data.items);
        setMeta(data.meta);
        setSummary(data.summary);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getUserErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, searchTerm, goalFilter, statusFilter, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));

  const handleViewUser = (user) => {
    setOpenMenuId(null);
    setSelectedUser(user);
  };

  const handleLockUser = (user) => {
    setOpenMenuId(null);
    setActionUser(user);
  };

  const handleUnlockUser = (user) => {
    setOpenMenuId(null);
    setActionUser(user);
  };

  const handleConfirmAction = async () => {
    const user = actionUser;

    if (!user) {
      return;
    }

    // Đóng modal ngay để tránh bấm xác nhận hai lần.
    setActionUser(null);

    try {
      await setUserLockedRequest(user.id, !user.locked);
      reloadUsers();
    } catch (err) {
      setError(getUserErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Người dùng</h1>

          <p className="mt-1 text-xs text-gray-500">
            Quản lý tài khoản của học viên.
          </p>
        </div>

        {/* Summary Cards */}
        <UserSummaryCards
          totalUsers={summary.total}
          activeUsers={summary.active}
          lockedUsers={summary.locked}
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Search & Filters */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo email..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={goalFilter}
              onChange={(event) => {
                setGoalFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 lg:w-48"
            >
              <option value="all">Tất cả mục tiêu</option>

              {Object.entries(GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 lg:w-44"
            >
              <option value="all">Tất cả trạng thái</option>

              <option value="active">Hoạt động</option>

              <option value="locked">Đã khóa</option>
            </select>
          </div>
        </section>

        {/* User Table */}
        <section className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    Học viên
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    Mục tiêu
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    Trạng thái
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    Ngày tham gia
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-16 text-center text-xs text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        Không tìm thấy học viên
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Thử thay đổi từ khóa hoặc bộ lọc.
                      </p>
                    </td>
                  </tr>
                )}

                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                          {getInitials(user.email)}
                        </div>

                        <p className="text-sm font-semibold text-gray-900">
                          {user.email}
                        </p>
                      </div>
                    </td>

                    {/* Goal */}
                    <td className="px-5 py-4">
                      <GoalBadge goal={user.goal} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge locked={user.locked} />
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-600">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        <UserActionMenu
                          user={user}
                          isOpen={openMenuId === user.id}
                          onToggle={setOpenMenuId}
                          onView={handleViewUser}
                          onLock={handleLockUser}
                          onUnlock={handleUnlockUser}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-xs text-gray-500">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {users.length}
              </span>{" "}
              / {meta.total} học viên
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 text-xs font-semibold text-gray-700">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      {/* Lock / Unlock Modal */}
      <UserActionModal
        user={actionUser}
        onClose={() => setActionUser(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

function getInitials(email) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("vi-VN");
}
