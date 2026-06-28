import { useState, useRef } from 'react';
import DropdownPortal from './components/DropdownPortal.jsx';

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

  const currentLabel = value ? OPTIONS.find(o => o.value === value)?.label || value : null;

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap transition-colors min-w-[90px] text-center ${
          value
            ? 'bg-accent/15 text-accent'
            : 'opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-secondary'
        }`}
        title="Repetir tarea"
      >
        {value ? `${ICONS[value] || ''} ${currentLabel}` : '+ repetir'}
      </button>

      <DropdownPortal open={open} triggerRef={ref} onClose={() => setOpen(false)}>
        {OPTIONS.map(opt => (
          <button
            key={opt.value || 'none'}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
              value === opt.value
                ? 'text-accent bg-accent/10'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </DropdownPortal>
    </>
  );
}

export { OPTIONS };
