export default function DashboardTrace({ metrics }) {
  const cards = [
    {
      label: 'Completadas hoy',
      value: metrics.completedToday,
      icon: (
        <svg className="w-4 h-4 text-green-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: 'Pendientes para hoy',
      value: metrics.pendingToday,
      icon: (
        <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3.5L11 10" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Completadas esta semana',
      value: metrics.completedWeek,
      icon: (
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="14" height="11" rx="1.5" />
          <path d="M1 6h14" />
          <path d="M5 1v4M11 1v4" />
        </svg>
      ),
    },
    {
      label: 'Vencidas',
      value: metrics.overdue,
      danger: metrics.overdue > 0,
      icon: (
        <svg className="w-4 h-4 text-red-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3M8 10.5v.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Tareas pendientes',
      value: metrics.totalPending,
      icon: (
        <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M5 8h6" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="md:pt-6 md:border-t md:border-border">
      <div className="flex items-center gap-3 mb-5">
        <svg className="w-5 h-5 text-accent flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 10h3l2-5 3 10 2-5 2 5 2-5 2 5 2-5 2 5 1-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="text-sm font-semibold text-text-primary">Trazabilidad</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map(card => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-[10px] p-4 max-sm:p-3 flex flex-col gap-1.5 max-sm:gap-1"
          >
            <div className="flex items-center gap-2">
              {card.icon}
              <span className="text-2xl max-sm:text-xl font-semibold text-text-primary">{card.value}</span>
            </div>
            <span className={`text-[11px] font-medium ${card.danger ? 'text-red-400' : 'text-text-tertiary'}`}>
              {card.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
