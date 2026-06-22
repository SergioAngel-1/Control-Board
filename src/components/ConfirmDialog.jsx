export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-surface-raised border border-border rounded-[10px] p-5 w-full max-w-sm shadow-lg animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-secondary mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-sm bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
          >
            {confirmLabel || 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
