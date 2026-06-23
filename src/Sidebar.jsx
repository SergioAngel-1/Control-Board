import { useState, useRef, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import NavSection from './NavSection.jsx';
import QuoteFooter from './QuoteFooter.jsx';

export default function Sidebar({
  categories, projectsByCategory, activeProjectId, view,
  catCollapsed, quotes, quoteIndex,
  onToggleCategory, onToggleSidebar, onNextQuote,
  onShowDashboard, onShowSettings, sidebarOpen, searchQuery, onSearchChange, onCreateProject,
  onCreateCategory, onRenameCategory, onDeleteCategory, onUpdateProject,
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let targetCategory = null;
    if (over.data.current?.sortable?.containerId) {
      targetCategory = over.data.current.sortable.containerId;
    } else if (over.data.current?.type === 'category') {
      targetCategory = over.data.current.category;
    }

    const sourceCategory = active.data.current?.sortable?.containerId;
    if (sourceCategory && targetCategory && sourceCategory !== targetCategory) {
      onUpdateProject(active.id, { category: targetCategory });
    }
  }
  const searchRef = useRef(null);

  useEffect(() => {
    function handle(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        } lg:hidden`}
        onClick={onToggleSidebar}
      />
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-[270px] h-screen bg-sidebar border-r border-border flex flex-col flex-shrink-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-5 pb-3.5 border-b border-border">
          <h1 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Control</h1>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="lg:hidden flex items-center justify-center w-5 h-5 text-text-tertiary hover:text-text-primary hover:bg-surface-hover rounded-sm text-sm"
            onClick={onToggleSidebar}
          >
            &#10005;
          </button>
        </div>
        <div className="px-3 pt-2 pb-1">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-surface border border-border text-xs text-text-tertiary">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5.5" /><path d="M11 11l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar…"
              className="flex-1 bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-tertiary"
            />
            <span className="text-[9px] text-text-tertiary bg-surface-raised px-1 py-0.5 rounded">Ctrl+K</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-1">
          <button
            type="button"
            onClick={onShowDashboard}
            className={`flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
              view === 'dashboard' ? 'text-accent bg-surface border-l-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border-l-2 border-transparent'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="16" height="14" rx="2" />
              <path d="M2 7h16" />
              <path d="M7 7v10" />
            </svg>
            Dashboard
          </button>
          <button
            type="button"
            onClick={onShowSettings}
            className={`flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer mt-0.5 ${
              view === 'settings' ? 'text-accent bg-surface border-l-2 border-accent' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border-l-2 border-transparent'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="3" />
              <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4M15.6 15.6l-1.4-1.4M5.8 5.8L4.4 4.4" strokeLinecap="round" />
            </svg>
            Ajustes
          </button>
          <div className="my-2 mx-4 border-t border-border" />
          {searchQuery ? (
            categories.map(cat => {
              const catLabel = typeof cat === 'string' ? cat : (cat?.name ?? cat);
              return (
                <NavSection
                  key={cat.id || cat}
                  category={cat}
                  projects={projectsByCategory[catLabel] || []}
                  activeProjectId={activeProjectId}
                  collapsed={catCollapsed[catLabel]}
                  onToggle={() => onToggleCategory(catLabel)}
                  onSelect={onCreateProject}
                  onRename={(name) => onRenameCategory(cat.id, name)}
                  onDelete={() => onDeleteCategory(cat.id)}
                  searchQuery={searchQuery}
                />
              );
            })
          ) : (
            <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
              {categories.map(cat => {
                const catLabel = typeof cat === 'string' ? cat : (cat?.name ?? cat);
                const catProjects = projectsByCategory[catLabel] || [];
                return (
                  <SortableContext key={cat.id || cat} id={catLabel} items={catProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <NavSection
                      category={cat}
                      projects={catProjects}
                      activeProjectId={activeProjectId}
                      collapsed={catCollapsed[catLabel]}
                      onToggle={() => onToggleCategory(catLabel)}
                      onSelect={onCreateProject}
                      onRename={(name) => onRenameCategory(cat.id, name)}
                      onDelete={() => onDeleteCategory(cat.id)}
                      searchQuery={searchQuery}
                    />
                  </SortableContext>
                );
              })}
            </DndContext>
          )}
          {!searchQuery && (
            <AddCategoryRow onCreate={onCreateCategory} />
          )}
        </nav>
        <QuoteFooter quotes={quotes} index={quoteIndex} onClick={onNextQuote} />
      </aside>
    </>
  );
}

function AddCategoryRow({ onCreate }) {
  const [focus, setFocus] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (focus && inputRef.current) inputRef.current.focus(); }, [focus]);

  function handleSubmit() {
    const t = name.trim();
    if (!t) return;
    onCreate(t);
    setName('');
    inputRef.current?.focus();
  }

  if (!focus) {
    return (
      <button
        type="button"
        onClick={() => setFocus(true)}
        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-text-tertiary hover:text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <span className="text-[10px] font-bold">+</span>
        Nueva categoría
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 px-4 py-1.5">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setName(''); setFocus(false); } }}
        onBlur={() => { if (!name.trim()) setFocus(false); }}
        placeholder="Nombre de la categoría"
        className="flex-1 bg-surface border border-border rounded-sm px-2 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none"
      />
      <button type="button" onClick={handleSubmit} className="text-xs text-accent hover:text-accent-hover px-1 font-medium">OK</button>
    </div>
  );
}
