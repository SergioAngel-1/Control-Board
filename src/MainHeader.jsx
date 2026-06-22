import { useState, useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { STATUSES, PRIORITIES } from './db/database.js';

export default function MainHeader({
  project, totalItems, doneItems, onUpdateProject, onDeleteProject, onAddSection,
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('checklist');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef(null);
  const notesRef = useRef(null);
  const statusRef = useRef(null);
  const priorityRef = useRef(null);

  const progress = project && totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  useEffect(() => {
    if (editingName && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editingName]);

  useEffect(() => {
    function handle(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusMenu(false);
      if (priorityRef.current && !priorityRef.current.contains(e.target)) setShowPriorityMenu(false);
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, []);

  if (!project) return null;

  function handleSaveName() {
    const t = nameVal.trim();
    if (t && t !== project.name) onUpdateProject(project.id, { name: t });
    else setNameVal(project.name);
    setEditingName(false);
  }

  function handleAddSection() {
    if (!newSectionTitle.trim()) return;
    onAddSection(project.id, newSectionTitle.trim(), newSectionType);
    setNewSectionTitle('');
    setShowAddSection(false);
  }

  function handleSaveNotes() {
    const n = notesVal.trim();
    if (n !== (project.notes || '')) onUpdateProject(project.id, { notes: n });
    setEditingNotes(false);
  }

  return (
    <div className="px-8 py-7 pb-4 border-b border-border max-sm:px-4 max-sm:pt-[60px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {editingName ? (
            <input
              ref={inputRef}
              type="text"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setNameVal(project.name); setEditingName(false); } }}
              onBlur={handleSaveName}
              className="bg-transparent border-none outline-none text-[22px] font-semibold max-sm:text-lg text-text-primary"
            />
          ) : (
            <h2
              className="text-[22px] font-semibold max-sm:text-lg text-text-primary cursor-pointer hover:text-text-secondary transition-colors"
              onDoubleClick={() => { setNameVal(project.name); setEditingName(true); }}
            >
              {project.name}
            </h2>
          )}
          <div ref={statusRef} className="relative">
            <button
              type="button"
              onClick={() => setShowStatusMenu(p => !p)}
              className="cursor-pointer"
            >
              <StatusBadge status={project.status} />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-surface-raised border border-border rounded-[8px] py-1 shadow-lg min-w-[140px]">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-surface-hover ${project.status === s ? 'text-text-primary bg-surface' : 'text-text-secondary'}`}
                    onClick={() => { onUpdateProject(project.id, { status: s }); setShowStatusMenu(false); }}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div ref={priorityRef} className="relative">
            <button
              type="button"
              onClick={() => setShowPriorityMenu(p => !p)}
              className="cursor-pointer"
            >
              <PriorityBadge priority={project.priority} />
            </button>
            {showPriorityMenu && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-surface-raised border border-border rounded-[8px] py-1 shadow-lg min-w-[120px]">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-surface-hover ${project.priority === p ? 'text-text-primary bg-surface' : 'text-text-secondary'}`}
                    onClick={() => { onUpdateProject(project.id, { priority: p }); setShowPriorityMenu(false); }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="text-text-tertiary">{doneItems}/{totalItems} &bull; {progress}%</span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddSection(p => !p)}
            className="text-text-tertiary hover:text-text-secondary px-1.5 py-0.5 rounded-sm hover:bg-surface-hover transition-colors"
            title="Añadir sección"
          >
            + Sec.
          </button>
          {showAddSection && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-surface-raised border border-border rounded-[8px] p-3 shadow-lg min-w-[200px]">
              <input
                type="text"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSection()}
                placeholder="Título de la sección"
                className="w-full bg-surface border border-border rounded-sm px-2 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none mb-2"
                autoFocus
              />
              <select
                value={newSectionType}
                onChange={e => setNewSectionType(e.target.value)}
                className="w-full bg-surface border border-border rounded-sm px-2 py-1 text-xs text-text-secondary outline-none mb-2"
              >
                <option value="checklist">Checklist</option>
                <option value="list">Lista</option>
                <option value="note">Nota</option>
              </select>
              <div className="flex gap-1">
                <button type="button" onClick={handleAddSection}
                  className="flex-1 px-2 py-1 text-xs font-medium rounded-sm bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors">
                  Crear
                </button>
                <button type="button" onClick={() => setShowAddSection(false)}
                  className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(p => !p)}
            className="text-text-tertiary hover:text-red-400 px-1.5 py-0.5 rounded-sm hover:bg-surface-hover transition-colors"
            title="Eliminar proyecto"
          >
            &#128465;
          </button>
          {showDeleteConfirm && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-surface-raised border border-border rounded-[8px] p-3 shadow-lg min-w-[180px]">
              <p className="text-xs text-text-secondary mb-2">¿Eliminar {project.name}?</p>
              <div className="flex gap-1">
                <button type="button"
                  onClick={() => { onDeleteProject(project.id); setShowDeleteConfirm(false); }}
                  className="flex-1 px-2 py-1 text-xs font-medium rounded-sm bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors">
                  Eliminar
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <div className="mt-3 flex items-start gap-2">
        {editingNotes ? (
          <div className="flex-1 flex gap-2">
            <input
              ref={notesRef}
              type="text"
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveNotes(); if (e.key === 'Escape') { setNotesVal(project.notes || ''); setEditingNotes(false); } }}
              onBlur={handleSaveNotes}
              placeholder="Notas del proyecto…"
              className="flex-1 bg-transparent border border-border rounded-sm px-2 py-1 text-xs text-text-secondary placeholder:text-text-tertiary outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => { setNotesVal(project.notes || ''); setEditingNotes(false); }}
              className="text-xs text-text-tertiary hover:text-text-secondary px-1"
            >
              &#10005;
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setNotesVal(project.notes || ''); setEditingNotes(true); }}
            className="flex-1 text-left text-xs text-text-tertiary hover:text-text-secondary transition-colors px-2 py-1 rounded-sm hover:bg-surface-hover"
          >
            {project.notes ? (
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3 text-text-tertiary flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
                  <path d="M6 5h4M6 8h4M6 11h2" strokeLinecap="round" />
                </svg>
                <span className="truncate">{project.notes}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
                  <path d="M6 5h4M6 8h4M6 11h2" strokeLinecap="round" />
                </svg>
                Añadir nota…
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
