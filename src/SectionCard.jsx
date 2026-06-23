import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import ChecklistSection from './ChecklistSection.jsx';
import ListSection from './ListSection.jsx';
import PipelineSection from './PipelineSection.jsx';
import NoteSection from './NoteSection.jsx';
import HistorySection from './HistorySection.jsx';

export default function SectionCard({
  section, items, pipelineSteps, collapsed,
  onToggle, onToggleItem, onDeleteItem, onUpdateItem, onAddItem,
  onDeleteSection, onRenameSection, onReorderItems,
  onAddPipelineStep, onUpdatePipelineStep, onDeletePipelineStep, onReorderPipelineSteps,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(section.title);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

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
    <section
      ref={setNodeRef}
      style={{ transform: transform && (transform.x || transform.y) ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, transition, opacity: isDragging ? 0.4 : undefined }}
      {...attributes}
      {...listeners}
      className="mb-5 group/section cursor-grab active:cursor-grabbing"
    >
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
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
      >
        <div className="overflow-hidden">
          <div className="py-0.5">
            {section.type === 'checklist' && (
              <ChecklistSection
                items={items}
                sectionId={section.id}
                onToggle={onToggleItem}
                onDeleteItem={onDeleteItem}
                onUpdateItem={onUpdateItem}
                onAddItem={onAddItem}
                onReorderItems={onReorderItems}
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
            {section.type === 'pipeline' && (
              <PipelineSection
                steps={pipelineSteps}
                sectionId={section.id}
                onAddStep={onAddPipelineStep}
                onUpdateStep={onUpdatePipelineStep}
                onDeleteStep={onDeletePipelineStep}
                onReorderSteps={onReorderPipelineSteps}
              />
            )}
            {section.type === 'note' && <NoteSection text={section.text || ''} />}
            {section.type === 'history' && <HistorySection items={items} onToggle={onToggleItem} />}
          </div>
        </div>
      </div>
    </section>
  );
}
