<<<<<<< HEAD
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { STATUS_DOT } from './constants/colors.js';
import { useConfirm } from './hooks/useConfirm.js';

function CategoryDropZone({ category, isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'catdrop-' + category,
    data: { type: 'category', category },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors rounded-sm ${
        isEmpty
          ? isOver
            ? 'h-10 border-2 border-dashed border-accent bg-accent/10'
            : 'h-10 border-2 border-dashed border-border-light'
          : isOver
            ? 'h-1 bg-accent/30'
            : 'h-0.5'
      }`}
    >
      {isEmpty && (
        <span className={`flex items-center justify-center h-full text-[11px] ${isOver ? 'text-accent font-medium' : 'text-text-tertiary'}`}>
          {isOver ? 'Soltar aquí' : 'Sin proyectos'}
        </span>
      )}
    </div>
  );
}

function ProjectRow({ project, activeProjectId, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { projectId: project.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 px-4 py-1.5 text-sm font-[450] cursor-grab active:cursor-grabbing transition-all border-l-2 hover:bg-surface ${
        activeProjectId === project.id
          ? 'text-text-primary bg-surface-raised border-l-accent'
          : 'text-text-secondary border-l-transparent'
      }`}
      onClick={() => onSelect(project.id)}
    >
      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: STATUS_DOT[project.status] || '#6b7280' }} />
      <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">{project.name}</span>
    </div>
  );
}

export default function NavSection({ category, projects, activeProjectId, collapsed, onToggle, onSelect, searchQuery, onRename, onDelete }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingCat, setEditingCat] = useState(false);
  const [catName, setCatName] = useState('');
  const confirm = useConfirm();

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
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await confirm({ title: 'Eliminar categoría', message: `¿Eliminar la categoría "${catLabel}"? Los proyectos se moverán a "Sin categoria".` });
                  if (ok) onDelete?.();
                }}
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
          <ProjectRow key={p.id} project={p} activeProjectId={activeProjectId} onSelect={onSelect} />
        ))}
        <CategoryDropZone category={catLabel} isEmpty={filtered.length === 0} />

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
=======
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { STATUS_DOT } from './constants/colors.js';
import { useConfirm } from './hooks/useConfirm.js';

function CategoryDropZone({ category, isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'catdrop-' + category,
    data: { type: 'category', category },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors rounded-sm ${
        isEmpty
          ? isOver
            ? 'h-10 border-2 border-dashed border-accent bg-accent/10'
            : 'h-10 border-2 border-dashed border-border-light'
          : isOver
            ? 'h-1 bg-accent/30'
            : 'h-0.5'
      }`}
    >
      {isEmpty && (
        <span className={`flex items-center justify-center h-full text-[11px] ${isOver ? 'text-accent font-medium' : 'text-text-tertiary'}`}>
          {isOver ? 'Soltar aquí' : 'Sin proyectos'}
        </span>
      )}
    </div>
  );
}

function ProjectRow({ project, activeProjectId, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { projectId: project.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 px-4 py-1.5 text-sm font-[450] cursor-grab active:cursor-grabbing transition-all border-l-2 hover:bg-surface ${
        activeProjectId === project.id
          ? 'text-text-primary bg-surface-raised border-l-accent'
          : 'text-text-secondary border-l-transparent'
      }`}
      onClick={() => onSelect(project.id)}
    >
      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: STATUS_DOT[project.status] || '#6b7280' }} />
      <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">{project.name}</span>
    </div>
  );
}

export default function NavSection({ category, projects, activeProjectId, collapsed, onToggle, onSelect, searchQuery, onRename, onDelete }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingCat, setEditingCat] = useState(false);
  const [catName, setCatName] = useState('');
  const confirm = useConfirm();

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
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await confirm({ title: 'Eliminar categoría', message: `¿Eliminar la categoría "${catLabel}"? Los proyectos se moverán a "Sin categoria".` });
                  if (ok) onDelete?.();
                }}
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
          <ProjectRow key={p.id} project={p} activeProjectId={activeProjectId} onSelect={onSelect} />
        ))}
        <CategoryDropZone category={catLabel} isEmpty={filtered.length === 0} />

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
>>>>>>> a73b4e1 (feat: re-inicialización de git)
}