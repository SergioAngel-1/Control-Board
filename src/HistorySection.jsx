import { formatDate, isOverdue } from './db/database.js';

export default function HistorySection({ items, onToggle }) {
  if (!items || items.length === 0) {
    return <div className="px-3 py-3 text-xs text-text-tertiary italic">No hay tareas completadas aún</div>;
  }

  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-pointer transition-colors text-sm font-[450] text-text-tertiary hover:bg-surface-raised"
          onClick={() => onToggle(item.id)}
        >
          <span className="w-[18px] h-[18px] rounded-[5px] border flex-shrink-0 flex items-center justify-center bg-green-500/20 border-green-500/40">
            <svg className="w-2.5 h-2.5 text-green-500" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <span className="flex-1 line-through transition-colors">
            {item.text}
          </span>

          {item.due_date && (
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${isOverdue(item.due_date) ? 'text-red-400/60 bg-red-500/10' : 'text-text-tertiary/60 bg-surface-raised'}`}>
              {formatDate(item.due_date)}
            </span>
          )}

          {item.tag && (
            <span className="text-[11px] bg-surface-raised text-text-tertiary/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {item.tag}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
