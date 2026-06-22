const PRIORITY = {
  critica:{label:'Critica',color:'#ef4444'},
  alta:{label:'Alta',color:'#f59e0b'},
  media:{label:'Media',color:'#3b82f6'},
  baja:{label:'Baja',color:'#6b7280'},
};

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
