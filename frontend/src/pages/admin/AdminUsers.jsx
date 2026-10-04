import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AdminSidebar from '../../layout/admin/AdminSidebar';

import UserSummaryCards from '../../components/admin/UserSummaryCards';
import UserDetailModal from '../../components/admin/UserDetailModal';
import UserActionModal from '../../components/admin/UserActionModal';

import {
  Search,
  MoreVertical,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const initialUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    goals: ['TOPIK 4', 'Giao tiếp'],
    status: 'active',
    progress: 72,
    joinedAt: '12/09/2026',
    topicsLearned: 8,
    vocabularyLearned: 156,
    lessonsCompleted: 24,
  },
  {
    id: 2,
    name: 'Trần Thị Mai',
    email: 'tranthimai@gmail.com',
    goals: ['TOPIK 3'],
    status: 'active',
    progress: 58,
    joinedAt: '10/09/2026',
    topicsLearned: 6,
    vocabularyLearned: 118,
    lessonsCompleted: 18,
  },
  {
    id: 3,
    name: 'Lê Minh Đức',
    email: 'leminhduc@gmail.com',
    goals: ['Giao tiếp'],
    status: 'active',
    progress: 45,
    joinedAt: '08/09/2026',
    topicsLearned: 5,
    vocabularyLearned: 94,
    lessonsCompleted: 14,
  },
  {
    id: 4,
    name: 'Phạm Hoàng Nam',
    email: 'phamhoangnam@gmail.com',
    goals: ['TOPIK 5'],
    status: 'locked',
    progress: 81,
    joinedAt: '05/09/2026',
    topicsLearned: 10,
    vocabularyLearned: 210,
    lessonsCompleted: 31,
  },
  {
    id: 5,
    name: 'Nguyễn Thùy Linh',
    email: 'nguyenthuylinh@gmail.com',
    goals: ['TOPIK 4', 'Giao tiếp'],
    status: 'active',
    progress: 64,
    joinedAt: '03/09/2026',
    topicsLearned: 7,
    vocabularyLearned: 137,
    lessonsCompleted: 21,
  },
  {
    id: 6,
    name: 'Đỗ Quốc Huy',
    email: 'doquochuy@gmail.com',
    goals: ['TOPIK 3', 'Giao tiếp'],
    status: 'active',
    progress: 37,
    joinedAt: '01/09/2026',
    topicsLearned: 4,
    vocabularyLearned: 76,
    lessonsCompleted: 11,
  },
];

const goalOptions = [
  'TOPIK 3',
  'TOPIK 4',
  'TOPIK 5',
  'Giao tiếp',
];

function StatusBadge({ status }) {
  if (status === 'locked') {
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
      {goal}
    </span>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="w-28">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-700">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function UserActionMenu({
  user,
  isOpen,
  onToggle,
  onView,
  onLock,
  onUnlock,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onToggle(null);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [isOpen, onToggle]);

  const handleMenuAction = (action) => {
    onToggle(null);

    if (action === 'view') {
      onView(user);
      return;
    }

    if (action === 'lock') {
      onLock(user);
      return;
    }

    if (action === 'unlock') {
      onUnlock(user);
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          onToggle(isOpen ? null : user.id)
        }
        className={`rounded-lg p-2 transition ${
          isOpen
            ? 'bg-gray-100 text-gray-700'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
        }`}
        title="Thao tác"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleMenuAction('view')}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-gray-700 transition hover:bg-gray-50"
          >
            Xem chi tiết
          </button>

          {user.status === 'active' ? (
            <button
              type="button"
              onClick={() => handleMenuAction('lock')}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-red-600 transition hover:bg-red-50"
            >
              <Lock className="h-3.5 w-3.5" />
              Khóa tài khoản
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                handleMenuAction('unlock')
              }
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
  const [users, setUsers] = useState(initialUsers);

  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);

      const matchesGoal =
        goalFilter === 'all' ||
        user.goals.includes(goalFilter);

      const matchesStatus =
        statusFilter === 'all' ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesGoal &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    goalFilter,
    statusFilter,
  ]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === 'active'
  ).length;

  const lockedUsers = users.filter(
    (user) => user.status === 'locked'
  ).length;

  const learningUsers = users.filter(
    (user) => user.progress > 0
  ).length;

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

  const handleConfirmAction = () => {
    if (!actionUser) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) => {
        if (user.id !== actionUser.id) {
          return user;
        }

        return {
          ...user,
          status:
            user.status === 'active'
              ? 'locked'
              : 'active',
        };
      })
    );

    setActionUser(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">
            Người dùng
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            Quản lý tài khoản và theo dõi hoạt động học tập của học viên.
          </p>
        </div>

        {/* Summary Cards */}
        <UserSummaryCards
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          lockedUsers={lockedUsers}
          learningUsers={learningUsers}
        />

        {/* Search & Filters */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Tìm theo tên hoặc email..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={goalFilter}
              onChange={(event) =>
                setGoalFilter(event.target.value)
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 lg:w-48"
            >
              <option value="all">
                Tất cả mục tiêu
              </option>

              {goalOptions.map((goal) => (
                <option
                  key={goal}
                  value={goal}
                >
                  {goal}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 lg:w-44"
            >
              <option value="all">
                Tất cả trạng thái
              </option>

              <option value="active">
                Hoạt động
              </option>

              <option value="locked">
                Đã khóa
              </option>
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
                    Tiến độ
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-16 text-center"
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        Không tìm thấy học viên
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Thử thay đổi từ khóa hoặc bộ lọc.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                            {getInitials(user.name)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Goals */}
                      <td className="px-5 py-4">
                        <div className="flex max-w-56 flex-wrap gap-1.5">
                          {user.goals.map((goal) => (
                            <GoalBadge
                              key={goal}
                              goal={goal}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={user.status}
                        />
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4">
                        <ProgressBar
                          progress={user.progress}
                        />
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-600">
                          {user.joinedAt}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <UserActionMenu
                            user={user}
                            isOpen={
                              openMenuId === user.id
                            }
                            onToggle={setOpenMenuId}
                            onView={handleViewUser}
                            onLock={handleLockUser}
                            onUnlock={handleUnlockUser}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-xs text-gray-500">
              Hiển thị{' '}
              <span className="font-semibold text-gray-700">
                {filteredUsers.length}
              </span>{' '}
              học viên
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg border border-gray-200 p-2 text-gray-300"
                disabled
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="h-8 w-8 rounded-lg bg-emerald-800 text-xs font-semibold text-white"
              >
                1
              </button>

              <button
                type="button"
                className="h-8 w-8 rounded-lg text-xs text-gray-500 transition hover:bg-gray-50"
              >
                2
              </button>

              <button
                type="button"
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
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

function getInitials(name) {
  return name
    .split(' ')
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}