import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { formatDate, isOverdue, getTraceabilityMetrics } from './db/database.js';
import DashboardTrace from './DashboardTrace.jsx';

function findNextTask(sections, itemsBySection) {
  const withDate = [];
  const withoutDate = [];
  for (const sec of sections) {
    const items = itemsBySection[sec.id] || [];
    for (const item of items) {
      if (item.done) continue;
      if (item.due_date) {
        withDate.push({ ...item, sectionTitle: sec.title });
      } else {
        withoutDate.push({ ...item, sectionTitle: sec.title });
      }
    }
  }
  if (withDate.length > 0) {
    withDate.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    return withDate[0];
  }
  return withoutDate[0] || null;
}

function getFutureTasks(sections, itemsBySection, nextTaskId) {
  const nextSteps = [];
  const futuro = [];
  for (const sec of sections) {
    const items = itemsBySection[sec.id] || [];
    const isFuturo = sec.title.toLowerCase() === 'futuro';
    for (const item of items) {
      if (item.done) continue;
      if (item.id === nextTaskId) continue;
      if (isFuturo) {
        futuro.push(item);
      } else {
        nextSteps.push(item);
      }
    }
  }
  return { nextSteps, futuro: futuro.slice(0, 3) };
}

function ProjectCard({ project, sections, itemsBySection, onSelect, onToggleItem }) {
  const nextTask = findNextTask(sections, itemsBySection);
  const { nextSteps, futuro } = getFutureTasks(sections, itemsBySection, nextTask?.id);

  return (
    <div
      className="bg-surface border border-border rounded-[10px] p-5 flex flex-col gap-3 transition-all hover:border-border-light hover:bg-surface-raised cursor-pointer animate-fade-in"
      onClick={() => onSelect(project.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onSelect(project.id); }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary truncate">{project.name}</h3>
        <PriorityBadge priority={project.priority} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={project.status} />
        {project.notes && (
          <span className="text-[11px] text-text-tertiary truncate max-w-[200px] max-sm:max-w-[120px]">{project.notes}</span>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-border">
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Próxima tarea</span>
        {nextTask ? (
          <div className="flex items-center gap-2 text-xs text-text-primary">
            <span
              className="w-[16px] h-[16px] rounded-[4px] border border-border-light bg-transparent flex-shrink-0 flex items-center justify-center transition-all hover:border-accent"
              onClick={e => { e.stopPropagation(); onToggleItem(nextTask.id); }}
              role="checkbox"
              tabIndex={-1}
            />
            <span className="truncate flex-1">{nextTask.text}</span>
            {nextTask.energy && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                nextTask.energy === 'alta' ? 'text-red-400 bg-red-500/10' :
                nextTask.energy === 'media' ? 'text-yellow-400 bg-yellow-500/10' :
                'text-green-400 bg-green-500/10'
              }`}>
                {nextTask.energy}
              </span>
            )}
            <span className={`text-[10px] flex-shrink-0 ${isOverdue(nextTask.due_date) ? 'text-red-400' : 'text-text-tertiary'}`}>
              {formatDate(nextTask.due_date)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-text-tertiary italic">—</span>
        )}
      </div>

      {(nextSteps.length > 0 || futuro.length > 0) && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-border">
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Tareas pendientes</span>
          {nextSteps.slice(0, 4).map(item => (
            <div key={item.id} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-1 h-1 rounded-full bg-text-tertiary flex-shrink-0" />
              <span className="truncate flex-1">{item.text}</span>
            </div>
          ))}
          {futuro.length > 0 && (
            <div className="mt-0.5 pt-1 border-t border-border/50">
              {futuro.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-xs text-text-tertiary">
                  <span className="w-1 h-1 rounded-full border border-text-tertiary flex-shrink-0" />
                  <span className="truncate flex-1">{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PRIORITY_ORDER = { critica: 0, alta: 1, media: 2, baja: 3 };
const ACTIVE_STATUSES = ['activo', 'optimizado', 'esperando'];

export default function Dashboard({ projects, onSelectProject, onToggleItem, onToggleSidebar }) {
  const metrics = getTraceabilityMetrics();
  const sorted = [...projects]
    .sort((a, b) => {
      const aActive = ACTIVE_STATUSES.includes(a.status) ? 0 : 1;
      const bActive = ACTIVE_STATUSES.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
    })
    .slice(0, 8);

  return (
    <div className="pt-6 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          aria-label="Abrir menú de proyectos"
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-7 h-7 -ml-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        </button>
        <svg className="w-5 h-5 text-accent flex-shrink-0 max-sm:hidden" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="16" height="14" rx="2" />
          <path d="M2 7h16" />
          <path d="M7 7v10" />
        </svg>
        <h2 className="text-lg font-semibold text-text-primary">Dashboard</h2>
        {sorted.length > 0 && (
          <span className="text-[11px] text-text-tertiary bg-surface-raised px-2 py-0.5 rounded-full">{sorted.length} proyectos</span>
        )}
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <div className="order-2 md:order-1">
          {sorted.length === 0 ? (
            <div className="text-center py-20 text-text-tertiary">
              <div className="text-3xl mb-3 opacity-30">&#x25A1;</div>
              <h2 className="text-lg font-semibold text-text-secondary mb-1.5">Sin proyectos</h2>
              <p className="text-sm">Crea un proyecto desde la barra lateral para ver el dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {sorted.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  sections={p.sections || []}
                  itemsBySection={p.itemsBySection || {}}
                  onSelect={onSelectProject}
                  onToggleItem={onToggleItem}
                />
              ))}
            </div>
          )}
        </div>

        {sorted.length > 0 && (
          <div className="order-1 md:order-2">
            <DashboardTrace metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
}
