interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Bevestigen',
  cancelText = 'Annuleren',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-drone-dark shadow-2xl">

        <div className="border-b border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-300 whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-700 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm text-white ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-drone-primary hover:brightness-110'
            }`}
          >
            {loading ? 'Bezig...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}