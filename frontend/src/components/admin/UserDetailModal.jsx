import {
  X,
  UserRound,
  Mail,
  Target,
  CalendarDays,
  Fingerprint,
} from "lucide-react";
import { getGoalLabel } from "../../api/users";

export default function UserDetailModal({ user, onClose }) {
  if (!user) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Thông tin học viên
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Thông tin tài khoản của học viên.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* User */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {getInitials(user.email)}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
              <Mail size={14} />
              {user.email}
            </div>
          </div>

          {/* Basic Information */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <InfoItem
              icon={Target}
              label="Mục tiêu học tập"
              value={getGoalLabel(user.goal)}
            />

            <InfoItem
              icon={CalendarDays}
              label="Ngày tham gia"
              value={new Date(user.createdAt).toLocaleDateString("vi-VN")}
            />

            <InfoItem
              icon={UserRound}
              label="Trạng thái"
              value={user.locked ? "Đã khóa" : "Hoạt động"}
              valueClass={user.locked ? "text-red-600" : "text-emerald-600"}
            />

            <InfoItem
              icon={Fingerprint}
              label="Mã tài khoản"
              value={user.id.slice(0, 8).toUpperCase()}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, valueClass = "text-slate-800" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <p className={`mt-2 text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function getInitials(email) {
  return email.slice(0, 2).toUpperCase();
}
