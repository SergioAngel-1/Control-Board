import { useState, useRef, useEffect } from 'react';
import ChecklistSection from './ChecklistSection.jsx';
import ListSection from './ListSection.jsx';
import PipelineSection from './PipelineSection.jsx';
import NoteSection from './NoteSection.jsx';

export default function SectionCard({
  section, items, pipelineSteps, collapsed,
  onToggle, onToggleItem, onDeleteItem, onUpdateItem, onAddItem,
  onDeleteSection, onRenameSection,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(section.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingTitle && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editingTitle]);

  function handleSaveTitle() {
    const t = titleVal.trim();
    if (t && t !== section.title) onRenameSection(section.id, t);
    else setTitleVal(section.title);
    setEditingTitle(false);
  }

  return (
    <section className="mb-5 group/section">
      <div className="flex items-center gap-2 py-2 rounded-sm transition-colors hover:bg-surface">
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 cursor-pointer select-none text-left"
        >
          <span className={`text-[10px] text-text-tertiary transition-transform duration-200 w-[18px] h-[18px] flex items-center justify-center ${collapsed ? '' : 'rotate-90'}`} aria-hidden="true">
            &#9654;
          </span>
          {editingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') { setTitleVal(section.title); setEditingTitle(false); } }}
              onBlur={handleSaveTitle}
              onClick={e => e.stopPropagation()}
              className="bg-transparent border-none outline-none text-xs font-semibold uppercase tracking-wide text-text-secondary flex-1"
            />
          ) : (
            <h3
              className="text-xs font-semibold uppercase tracking-wide text-text-secondary flex-1"
              onDoubleClick={e => { e.stopPropagation(); setTitleVal(section.title); setEditingTitle(true); }}
            >
              {section.title}
            </h3>
          )}
        </button>
        <button
          type="button"
          onClick={() => onDeleteSection(section.id)}
          className="opacity-0 group-hover/section:opacity-100 transition-opacity text-text-tertiary hover:text-red-400 text-xs px-1"
          title="Eliminar sección"
        >
          &#10005;
        </button>
      </div>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: collapsed ? '0' : '2000px' }}
      >
        <div className="py-0.5">
          {section.type === 'checklist' && (
            <ChecklistSection
              items={items}
              sectionId={section.id}
              onToggle={onToggleItem}
              onDeleteItem={onDeleteItem}
              onUpdateItem={onUpdateItem}
              onAddItem={onAddItem}
            />
          )}
          {section.type === 'list' && (
            <ListSection
              items={items}
              sectionId={section.id}
              onDeleteItem={onDeleteItem}
              onUpdateItem={onUpdateItem}
              onAddItem={onAddItem}
            />
          )}
          {section.type === 'pipeline' && <PipelineSection steps={pipelineSteps} />}
          {section.type === 'note' && <NoteSection text={section.text || ''} />}
        </div>
      </div>
    </section>
  );
}
