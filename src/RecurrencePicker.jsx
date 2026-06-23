import { useState, useRef, useEffect } from 'react';

const OPTIONS = [
  { value: null, label: 'No repetir', icon: null },
  { value: 'daily', label: 'Cada día', icon: '\u{1F504}' },
  { value: 'weekdays', label: 'Lun–Vie', icon: '\u{1F4C5}' },
  { value: 'weekly', label: 'Cada semana', icon: '\u{1F4CB}' },
  { value: 'monthly', label: 'Cada mes', icon: '\u{1F4C6}' },
  { value: 'yearly', label: 'Cada año', icon: '\u{1F4C8}' },
];

const ICONS = { daily: '\u21BB', weekdays: '\u{1F4C5}', weekly: '\u{1F4CB}', monthly: '\u{1F4C6}', yearly: '\u{1F4C8}' };

export default function RecurrencePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, []);

  const currentLabel = value ? OPTIONS.find(o => o.value === value)?.label || value : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className={`text-[11px] px-1.5 py-0.5 rounded-full whitespace-nowrap transition-colors ${
          value
            ? 'bg-accent/15 text-accent'
            : 'opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-secondary'
        }`}
        title="Repetir tarea"
      >
        {value ? `${ICONS[value] || ''} ${currentLabel}` : '+ repetir'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface-raised border border-border rounded-md shadow-lg z-50 py-1 min-w-[140px]">
          {OPTIONS.map(opt => (
            <button
              key={opt.value || 'none'}
              type="button"
              onClick={e => {
                e.stopPropagation();
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                value === opt.value
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { OPTIONS };
