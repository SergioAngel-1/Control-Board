import { useState, useRef, useEffect } from 'react';
import { formatDate, isOverdue } from './db/database.js';

export default function ChecklistItem({ item, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.text);
  const [editingDate, setEditingDate] = useState(false);
  const inputRef = useRef(null);
  const dateRef = useRef(null);
  const done = !!item.done;

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
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [editingDate]);

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
      className="group flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-pointer transition-colors text-sm font-[450] text-text-primary hover:bg-surface-raised"
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
        <span
          className={`flex-1 transition-colors ${done ? 'line-through text-text-tertiary' : ''}`}
          onDoubleClick={e => { e.stopPropagation(); setVal(item.text); setEditing(true); }}
        >
          {item.text}
        </span>
      )}

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
          className={`text-[11px] px-1.5 py-0.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${isOverdue(item.due_date) ? 'text-red-400 bg-red-500/10' : 'text-text-tertiary bg-surface-raised hover:bg-surface-hover'}`}
          onClick={e => { e.stopPropagation(); setEditingDate(true); }}
        >
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
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-text-secondary text-[10px] px-1 py-0.5"
          title="Añadir fecha"
        >
          + fecha
        </button>
      )}

      {item.tag && !editing && (
        <span className="text-[11px] bg-surface-raised text-text-tertiary px-1.5 py-0.5 rounded-full whitespace-nowrap">
          {item.tag}
        </span>
      )}

      {!editing && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(item.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-red-400 text-xs px-1 py-0.5"
          title="Eliminar"
        >
          &#10005;
        </button>
      )}
    </div>
  );
}
