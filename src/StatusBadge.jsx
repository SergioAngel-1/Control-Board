const STATUS = {
  activo:{label:'Activo',color:'#22c55e'},
  esperando:{label:'Esperando',color:'#f59e0b'},
  esperando_contrato:{label:'Esperando contrato',color:'#f59e0b'},
  standby:{label:'Standby',color:'#6b7280'},
  cerrado:{label:'Cerrado',color:'#ef4444'},
  estrategico:{label:'Estrategico',color:'#8b5cf6'},
  prospecto:{label:'Prospecto',color:'#3b82f6'},
  optimizado:{label:'Optimizado',color:'#06b6d4'},
  terminado:{label:'Terminado',color:'#22c55e'},
  mv_terminado:{label:'MVP terminado',color:'#8b5cf6'},
  pendientes:{label:'Pendientes',color:'#6b7280'},
};

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
