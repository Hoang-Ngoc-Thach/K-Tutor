import {
  X,
  UserRound,
  Mail,
  Target,
  CalendarDays,
  BookOpen,
  BookMarked,
  CheckCircle2,
} from 'lucide-react';

export default function UserDetailModal({
  user,
  onClose,
}) {
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
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Thông tin học viên
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Thông tin học tập và tài khoản của học viên.
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
              {getInitials(user.name)}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {user.name}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail size={14} />
                {user.email}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Target size={14} />
                Mục tiêu học tập
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.goals.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            <InfoItem
              icon={CalendarDays}
              label="Ngày tham gia"
              value={user.joinedAt}
            />

            <InfoItem
              icon={UserRound}
              label="Trạng thái"
              value={
                user.status === 'active'
                  ? 'Hoạt động'
                  : 'Đã khóa'
              }
              valueClass={
                user.status === 'active'
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }
            />

            <InfoItem
              icon={BookOpen}
              label="Mã học viên"
              value={`KT-${String(user.id).padStart(4, '0')}`}
            />
          </div>

          {/* Progress */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Tiến độ học tập
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Mức độ hoàn thành lộ trình hiện tại
                </p>
              </div>

              <span className="text-lg font-bold text-emerald-700">
                {user.progress}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{
                  width: `${user.progress}%`,
                }}
              />
            </div>
          </div>

          {/* Learning Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard
              icon={BookOpen}
              value={user.topicsLearned}
              label="Chủ đề đã học"
            />

            <StatCard
              icon={BookMarked}
              value={user.vocabularyLearned}
              label="Từ vựng đã học"
            />

            <StatCard
              icon={CheckCircle2}
              value={user.lessonsCompleted}
              label="Bài hoàn thành"
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

function InfoItem({
  icon: Icon,
  label,
  value,
  valueClass = 'text-slate-800',
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon size={16} />
      </div>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
        {label}
      </p>
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