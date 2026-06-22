import { useState } from 'react';

const STATUS_DOT = {
  activo:'#22c55e', esperando:'#f59e0b', esperando_contrato:'#f59e0b',
  standby:'#6b7280', cerrado:'#ef4444', estrategico:'#8b5cf6',
  prospecto:'#3b82f6', optimizado:'#06b6d4', terminado:'#22c55e',
  mv_terminado:'#8b5cf6', pendientes:'#6b7280',
};

export default function NavSection({ category, projects, activeProjectId, collapsed, onToggle, onSelect, searchQuery, onRename, onDelete }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingCat, setEditingCat] = useState(false);
  const [catName, setCatName] = useState('');

  const catLabel = typeof category === 'string' ? category : (category?.name ?? category);

  const filtered = searchQuery
    ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects;

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onSelect(null, catLabel, newName.trim(), 'activo', 'media');
    setNewName('');
    setShowNewForm(false);
  }

  return (
    <div className="mb-1 group/cat">
      <div className="flex items-center justify-between px-4 py-1">
        {editingCat ? (
          <input
            type="text"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { const t = catName.trim(); if (t && t !== catLabel) onRename?.(t); setEditingCat(false); } if (e.key === 'Escape') setEditingCat(false); }}
            onBlur={() => { const t = catName.trim(); if (t && t !== catLabel) onRename?.(t); setEditingCat(false); }}
            className="flex-1 bg-surface border border-border rounded-sm px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-primary outline-none"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary cursor-pointer select-none hover:text-text-secondary flex-1 min-w-0"
            onClick={onToggle}
          >
            <span className={`text-[8px] transition-transform duration-200 inline-block flex-shrink-0 ${collapsed ? '' : 'rotate-90'}`}>&#9654;</span>
            <span className="truncate">{catLabel}</span>
          </div>
        )}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!searchQuery && !editingCat && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCatName(catLabel); setEditingCat(true); }}
                className="opacity-0 group-hover/cat:opacity-100 text-text-tertiary hover:text-text-secondary text-[10px] px-1 rounded-sm hover:bg-surface-hover transition-colors"
                title="Renombrar categoría"
              >
                &#9998;
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar categoría "${catLabel}"?`)) onDelete?.(); }}
                className="opacity-0 group-hover/cat:opacity-100 text-text-tertiary hover:text-red-400 text-[10px] px-1 rounded-sm hover:bg-surface-hover transition-colors"
                title="Eliminar categoría"
              >
                &#10005;
              </button>
            </>
          )}
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setShowNewForm(p => !p)}
              className="text-text-tertiary hover:text-text-secondary text-xs px-1 rounded-sm hover:bg-surface-hover transition-colors"
              title="Nuevo proyecto"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="overflow-hidden transition-[max-height] duration-250 ease-out" style={{ maxHeight: collapsed ? '0' : '2000px' }}>
        {filtered.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-[450] cursor-pointer transition-all border-l-2 hover:bg-surface ${
              activeProjectId === p.id
                ? 'text-text-primary bg-surface-raised border-l-accent'
                : 'text-text-secondary border-l-transparent'
            }`}
            onClick={() => onSelect(p.id)}
          >
            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: STATUS_DOT[p.status] || '#6b7280' }} />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">{p.name}</span>
          </div>
        ))}

        {showNewForm && (
          <form onSubmit={handleCreate} className="px-4 py-1.5 flex gap-1">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="flex-1 bg-surface border border-border rounded-sm px-2 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none"
              autoFocus
              onKeyDown={e => e.key === 'Escape' && (setShowNewForm(false), setNewName(''))}
            />
            <button
              type="submit"
              className="px-2 py-1 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
            >
              OK
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
