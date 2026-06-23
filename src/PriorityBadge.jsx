import { PRIORITY } from './constants/colors.js';

export default function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || { label: priority, color: '#6b7280' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}25` }}
    >
      {p.label}
    </span>
  );
}
