import { useEffect, useRef } from 'react';

export default function AlertConfirm({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) confirmRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmStyle =
    variant === 'danger'
      ? 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'
      : 'bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
    >
      <div
        className="bg-surface-raised border border-border rounded-lg p-5 shadow-xl max-w-[320px] w-full mx-4 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h3 id="alert-title" className="text-sm font-semibold text-text-primary mb-2">
            {title}
          </h3>
        )}
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-sm text-text-tertiary hover:text-text-secondary hover:bg-surface-hover transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
