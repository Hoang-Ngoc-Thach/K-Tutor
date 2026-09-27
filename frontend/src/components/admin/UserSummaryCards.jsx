import {
  Users,
  CircleCheck,
  LockKeyhole,
  BookOpen,
} from 'lucide-react';

export default function UserSummaryCards({
  totalUsers,
  activeUsers,
  lockedUsers,
  learningUsers,
}) {
  const activePercent = totalUsers
    ? ((activeUsers / totalUsers) * 100).toFixed(1)
    : 0;

  const lockedPercent = totalUsers
    ? ((lockedUsers / totalUsers) * 100).toFixed(1)
    : 0;

  return (
    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Tổng học viên"
        value={totalUsers}
        description="Đăng ký qua cổng học viên"
        icon={Users}
        iconClass="bg-emerald-100 text-emerald-600"
      />

      <SummaryCard
        title="Đang hoạt động"
        value={activeUsers}
        description={`${activePercent}% tổng số`}
        icon={CircleCheck}
        iconClass="bg-emerald-100 text-emerald-600"
        progress={totalUsers ? (activeUsers / totalUsers) * 100 : 0}
      />

      <SummaryCard
        title="Đã khóa"
        value={lockedUsers}
        description={`${lockedPercent}% tổng số`}
        icon={LockKeyhole}
        iconClass="bg-indigo-100 text-indigo-600"
      />

      <SummaryCard
        title="Đang học"
        value={learningUsers}
        description="Có hoạt động học tập"
        icon={BookOpen}
        iconClass="bg-emerald-100 text-emerald-600"
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  progress,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={16} />
        </div>
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>

        {typeof progress === 'number' && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}