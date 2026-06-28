import { useState, useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { STATUSES, PRIORITIES } from './db/database.js';
import { useConfirm } from './hooks/useConfirm.js';

export default function MainHeader({
  project, totalItems, doneItems, onUpdateProject, onDeleteProject, onAddSection, onToggleSidebar,
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
  const confirm = useConfirm();
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
    <div className="sticky top-0 z-20 px-8 py-7 pb-4 border-b border-border max-sm:px-3 bg-base/80 backdrop-blur-md">
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex items-center gap-3 min-w-0 max-sm:flex-wrap">
          <button
            type="button"
            aria-label="Abrir menú de proyectos"
            aria-expanded={false}
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center w-7 h-7 -ml-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            </svg>
          </button>
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
            <div className="flex items-center gap-1.5">
              <h2
                className="text-[22px] font-semibold max-sm:text-lg text-text-primary"
              >
                {project.name}
              </h2>
              <button
                type="button"
                onClick={() => { setNameVal(project.name); setEditingName(true); }}
                className="text-text-tertiary hover:text-text-secondary transition-colors px-1 py-0.5 rounded-sm hover:bg-surface-hover"
                title="Renombrar proyecto"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11.5 1.5l3 3L5 14H2v-3l9.5-9.5z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
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
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-text-secondary flex-wrap">
          <div ref={priorityRef} className="relative">
            <button
              type="button"
              onClick={() => setShowPriorityMenu(p => !p)}
              className="cursor-pointer"
            >
              <PriorityBadge priority={project.priority} />
            </button>
            {showPriorityMenu && (
              <div className="absolute right-0 mt-1 z-50 bg-surface-raised border border-border rounded-[8px] py-1 shadow-lg min-w-[120px] max-sm:right-auto max-sm:left-0">
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
            <div className="absolute top-full right-0 max-sm:right-auto max-sm:left-0 mt-1 z-50 bg-surface-raised border border-border rounded-[8px] p-2.5 max-sm:p-2 shadow-lg min-w-[180px] max-sm:min-w-0 max-sm:w-[calc(100dvw-32px)] max-sm:max-w-[220px]">
              <input
                type="text"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSection()}
                placeholder="Título"
                className="w-full bg-surface border border-border rounded-sm px-2 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none mb-1.5"
                autoFocus
              />
              <select
                value={newSectionType}
                onChange={e => setNewSectionType(e.target.value)}
                className="w-full bg-surface border border-border rounded-sm px-2 py-1 text-xs text-text-secondary outline-none mb-1.5"
              >
                <option value="checklist">Checklist</option>
                <option value="list">Lista</option>
                <option value="note">Nota</option>
                <option value="pipeline">Pipeline</option>
              </select>
              <div className="flex gap-1.5">
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
            onClick={async () => {
              const ok = await confirm({ title: 'Eliminar proyecto', message: `¿Eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.` });
              if (ok) onDeleteProject(project.id);
            }}
            className="text-text-tertiary hover:text-red-400 px-1.5 py-0.5 rounded-sm hover:bg-surface-hover transition-colors"
            title="Eliminar proyecto"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h12M5.5 3V2a1 1 0 011-1h3a1 1 0 011 1v1M3 3l1 11.5a1 1 0 001 .5h6a1 1 0 001-.5L13 3" strokeLinejoin="round" />
              <path d="M6 6v6M10 6v6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      </div>
      <div className="mt-3 flex items-start gap-2 max-sm:flex-col">
        {editingNotes ? (
          <div className="flex-1 flex gap-2 min-w-0">
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
            className="flex-1 text-left text-xs text-text-tertiary hover:text-text-secondary transition-colors px-2 py-1 rounded-sm hover:bg-surface-hover min-w-0 max-sm:max-w-full overflow-hidden"
          >
            {project.notes ? (
              <span className="flex items-center gap-2 min-w-0">
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
