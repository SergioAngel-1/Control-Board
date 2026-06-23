import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { formatDate, isOverdue } from './db/database.js';
import RecurrencePicker from './RecurrencePicker.jsx';

const ENERGY_OPTS = [
  { value: null, label: 'Sin energía' },
  { value: 'alta', label: 'Alta', cls: 'text-red-400 bg-red-500/10 hover:bg-red-500/20' },
  { value: 'media', label: 'Media', cls: 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20' },
  { value: 'baja', label: 'Baja', cls: 'text-green-400 bg-green-500/10 hover:bg-green-500/20' },
];

const ENERGY_MAP = { alta: ENERGY_OPTS[1], media: ENERGY_OPTS[2], baja: ENERGY_OPTS[3] };

export default function ChecklistItem({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.text);
  const [editingDate, setEditingDate] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const inputRef = useRef(null);
  const dateRef = useRef(null);
  const energyRef = useRef(null);
  const done = !!item.done;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (editingDate && dateRef.current) {
      dateRef.current.focus();
      dateRef.current.showPicker?.();
    }
  }, [editingDate]);

  useEffect(() => {
    function handle(e) {
      if (editingDate && dateRef.current && !dateRef.current.contains(e.target)) {
        setEditingDate(false);
      }
      if (energyOpen && energyRef.current && !energyRef.current.contains(e.target)) {
        setEnergyOpen(false);
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [editingDate, energyOpen]);

  function handleSave() {
    const t = val.trim();
    if (t && t !== item.text) onUpdate(item.id, t);
    else setVal(item.text);
    setEditing(false);
  }

  function handleDateChange(e) {
    const newDate = e.target.value || null;
    onUpdate(item.id, { due_date: newDate });
    setEditingDate(false);
  }

  function handleClearDate(e) {
    e.stopPropagation();
    onUpdate(item.id, { due_date: null });
    setEditingDate(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: transform && (transform.x || transform.y) ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, transition, opacity: isDragging ? 0.4 : undefined }}
      {...attributes}
      {...listeners}
      className="group flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-grab active:cursor-grabbing transition-colors text-sm font-[450] text-text-primary hover:bg-surface-raised max-sm:gap-2 max-sm:py-2.5 max-sm:flex-wrap"
      onClick={() => { if (!editing) onToggle(); }}
    >
      <span
        className={`w-[18px] h-[18px] rounded-[5px] border flex-shrink-0 flex items-center justify-center transition-all ${
          done ? 'bg-green-500 border-green-500' : 'border-border-light bg-transparent group-hover:border-text-tertiary'
        }`}
      >
        {done && (
          <svg className="w-2.5 h-2.5 text-base" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setVal(item.text); setEditing(false); } }}
          onBlur={handleSave}
          onClick={e => e.stopPropagation()}
          className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary"
        />
      ) : (
        <span className="flex-1 max-sm:w-full flex items-center gap-1 min-w-0">
          <span
            className={`flex-1 min-w-0 truncate transition-colors ${done ? 'line-through text-text-tertiary' : ''}`}
            onDoubleClick={e => { e.stopPropagation(); setVal(item.text); setEditing(true); }}
          >
            {item.text}
          </span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(item.id); }}
            className="opacity-0 group-hover:opacity-100 max-sm:opacity-40 transition-opacity text-text-tertiary hover:text-red-400 text-xs px-1 py-0.5 flex-shrink-0"
            title="Eliminar"
          >
            &#10005;
          </button>
        </span>
      )}

      <div className="flex items-center gap-2 max-sm:gap-1.5 max-sm:w-full max-sm:flex-wrap">
        {!editing && editingDate ? (
          <input
            ref={dateRef}
            type="date"
            defaultValue={item.due_date || ''}
            onChange={handleDateChange}
            onKeyDown={e => { if (e.key === 'Escape') setEditingDate(false); }}
            className="w-[120px] text-[11px] bg-surface border border-border rounded-sm px-1.5 py-0.5 text-text-primary outline-none"
          />
        ) : !editing && item.due_date ? (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap cursor-pointer transition-colors min-w-[90px] text-center ${isOverdue(item.due_date) ? 'text-red-400 bg-red-500/10' : 'text-text-tertiary bg-surface-raised hover:bg-surface-hover'}`}
            onClick={e => { e.stopPropagation(); setEditingDate(true); }}
          >
            <svg className="w-2.5 h-2.5 mr-1 inline-block align-middle" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <rect x="1.5" y="3" width="9" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 5.5h9" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {formatDate(item.due_date)}
            <button
              type="button"
              onClick={handleClearDate}
              className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 text-[9px]"
              title="Quitar fecha"
            >
              &#10005;
            </button>
          </span>
        ) : !editing && !item.due_date && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setEditingDate(true); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-text-secondary text-[10px] px-1 py-0.5 max-sm:hidden"
            title="Añadir fecha"
          >
            + fecha
          </button>
        )}

        {item.tag && !editing && (
          <span className="text-[11px] bg-accent/10 text-accent border border-accent/15 px-2 py-0.5 rounded-full whitespace-nowrap font-medium min-w-[90px] text-center">
            <svg className="w-2.5 h-2.5 mr-1 inline-block align-middle" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1.5 6.5V1.5h5l4.5 4.5-5 5L1.5 6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="4" cy="4" r="0.8" fill="currentColor" />
            </svg>
            {item.tag}
          </span>
        )}

        {!editing && !done && (
          <div ref={energyRef} className={`relative ${!item.energy ? 'max-sm:hidden' : ''}`}>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setEnergyOpen(!energyOpen); }}
              className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap transition-colors min-w-[90px] text-center ${
                item.energy
                  ? `${ENERGY_MAP[item.energy]?.cls || 'text-text-tertiary bg-surface-raised'}`
                  : 'opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-secondary'
              }`}
              title="Energía requerida"
            >
              <svg className="w-2.5 h-2.5 mr-1 inline-block align-middle" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6.5 1l-4 5.5h3L5 11l4-5.5H6L6.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              {item.energy ? ENERGY_MAP[item.energy]?.label || item.energy : '+ energía'}
            </button>
            {energyOpen && (
              <div className="absolute right-0 top-full mt-1 bg-surface-raised border border-border rounded-md shadow-lg z-50 py-1 min-w-[120px]">
                {ENERGY_OPTS.map(opt => (
                  <button
                    key={opt.value || 'none'}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onUpdate(item.id, { energy: opt.value });
                      setEnergyOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      item.energy === opt.value
                        ? 'text-accent bg-accent/10'
                        : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {opt.value && <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${opt.cls?.split(' ')[0] || ''}`} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!editing && !done && (
          <span className={item.recurrence ? '' : 'max-sm:hidden'}>
            <RecurrencePicker
              value={item.recurrence}
              onChange={val => onUpdate(item.id, { recurrence: val })}
            />
          </span>
        )}

      </div>
    </div>
  );
}
