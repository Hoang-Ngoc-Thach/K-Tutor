import { Lock, Unlock, X } from 'lucide-react';

export default function UserActionModal({
  user,
  onClose,
  onConfirm,
}) {
  if (!user) return null;

  const isLocking = user.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isLocking
                ? 'bg-red-50 text-red-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isLocking ? <Lock size={19} /> : <Unlock size={19} />}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isLocking
              ? 'Khóa tài khoản?'
              : 'Mở khóa tài khoản?'}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isLocking
              ? `Bạn có chắc muốn khóa tài khoản của ${user.name} không?`
              : `Bạn có chắc muốn mở khóa tài khoản của ${user.name} không?`}
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              {user.name}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              isLocking
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLocking ? 'Khóa tài khoản' : 'Mở khóa'}
          </button>
        </div>
      </div>
    </div>
  );
}