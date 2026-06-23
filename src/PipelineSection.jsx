import { useState, useRef, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useConfirm } from './hooks/useConfirm.js';

function PipelineStep({ step, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(step.text);
  const confirm = useConfirm();
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [editing]);

  function handleSave() {
    const t = val.trim();
    if (t && t !== step.text) onUpdate(step.id, t);
    else setVal(step.text);
    setEditing(false);
  }

  return (
    <span
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : undefined }}
      {...attributes}
      {...listeners}
      className="flex items-center gap-0 cursor-grab active:cursor-grabbing"
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setVal(step.text); setEditing(false); } }}
          onBlur={handleSave}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-surface border border-accent/25 text-text-primary outline-none w-[120px] sm:w-auto"
        />
      ) : (
        <span
          onClick={() => onUpdate(step.id, { active: !step.active })}
          onDoubleClick={e => { e.stopPropagation(); setVal(step.text); setEditing(true); }}
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            step.active
              ? 'bg-accent/15 border border-accent/25 text-accent'
              : 'bg-surface-raised border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }`}
        >
          {step.text}
        </span>
      )}
      <button
        type="button"
        onClick={async () => {
          const ok = await confirm({ title: 'Eliminar paso', message: `¿Eliminar "${step.text}"?` });
          if (ok) onDelete(step.id);
        }}
        className="ml-0.5 opacity-0 group-hover/pipeline:opacity-100 transition-opacity text-text-tertiary hover:text-red-400 text-[10px] px-0.5 rounded-full hover:bg-surface-hover"
        title="Eliminar paso"
      >
        &#10005;
      </button>
    </span>
  );
}

export default function PipelineSection({ steps, sectionId, onAddStep, onUpdateStep, onDeleteStep, onReorderSteps }) {
  const [text, setText] = useState('');
  const [focus, setFocus] = useState(false);
  const inputRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => { if (focus && inputRef.current) inputRef.current.focus(); }, [focus]);

  function handleSubmit() {
    const t = text.trim();
    if (!t) return;
    onAddStep(sectionId, t);
    setText('');
    inputRef.current?.focus();
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = steps.map(s => s.id);
    const oldIdx = ids.indexOf(active.id);
    const newIdx = ids.indexOf(over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    ids.splice(oldIdx, 1);
    ids.splice(newIdx, 0, active.id);
    onReorderSteps(sectionId, ids);
  }

  return (
    <div className="group/pipeline">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={steps.map(s => s.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 py-3 px-2">
            {steps.map((step, i) => (
              <span key={step.id} className="flex items-center gap-0">
                <PipelineStep step={step} onUpdate={onUpdateStep} onDelete={onDeleteStep} />
                {i < steps.length - 1 && <span className="text-text-tertiary text-xs mx-1 sm:mx-1.5">&#8250;</span>}
              </span>
            ))}
            {focus ? (
              <span className="flex items-center gap-1 rounded-full bg-surface border border-accent/25 pl-2.5 sm:pl-3 pr-1 py-1 sm:py-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setText(''); setFocus(false); } }}
                  onBlur={() => { if (!text.trim()) setFocus(false); }}
                  placeholder="Nuevo paso"
                  className="w-24 sm:w-28 bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-tertiary"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-accent hover:text-accent-hover text-xs px-1 font-medium"
                >
                  +
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setFocus(true)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border border-dashed border-border-light text-text-tertiary hover:text-text-secondary hover:border-text-tertiary transition-colors cursor-pointer"
              >
                + Añadir paso
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}