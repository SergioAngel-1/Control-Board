import { STATUS } from './constants/colors.js';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: '#6b7280' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
