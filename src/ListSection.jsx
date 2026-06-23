import { useState, useRef, useEffect } from 'react';
import { formatDate, isOverdue } from './db/database.js';
import { useConfirm } from './hooks/useConfirm.js';

function ListItem({ item, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.text);
  const [editingDate, setEditingDate] = useState(false);
  const confirm = useConfirm();
  const inputRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
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
    if (t && t !== item.text) onUpdate(item.id, { text: t });
    else setVal(item.text);
    setEditing(false);
  }

  function handleDateChange(e) {
    onUpdate(item.id, { due_date: e.target.value || null });
    setEditingDate(false);
  }

  function handleClearDate(e) {
    e.stopPropagation();
    onUpdate(item.id, { due_date: null });
    setEditingDate(false);
  }

  return (
    <div className="group flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-sm font-[450] text-text-primary hover:bg-surface-raised transition-colors">
      <span className="w-[5px] h-[5px] rounded-full bg-text-tertiary flex-shrink-0" />
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setVal(item.text); setEditing(false); } }}
          onBlur={handleSave}
          className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary"
        />
      ) : (
        <span
          className="flex-1"
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
      {!editing && (
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({ title: 'Eliminar item', message: `¿Eliminar "${item.text}"?` });
            if (ok) onDelete(item.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-red-400 text-xs px-1 py-0.5"
          title="Eliminar"
        >
          &#10005;
        </button>
      )}
    </div>
  );
}

export default function ListSection({ items, onDeleteItem, onUpdateItem, onAddItem, sectionId }) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map(item => (
        <ListItem key={item.id} item={item} onDelete={onDeleteItem} onUpdate={onUpdateItem} />
      ))}
      <AddItemRow sectionId={sectionId} onAdd={onAddItem} placeholder="Añadir item…" />
    </div>
  );
}

function AddItemRow({ sectionId, onAdd, placeholder }) {
  const [focus, setFocus] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (focus && inputRef.current) inputRef.current.focus(); }, [focus]);

  function handleSubmit() {
    const t = text.trim();
    if (!t) return;
    onAdd(sectionId, t);
    setText('');
    inputRef.current?.focus();
  }

  if (!focus) {
    return (
      <button
        type="button"
        onClick={() => setFocus(true)}
        className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-sm text-sm text-text-tertiary hover:text-text-secondary hover:bg-surface-raised transition-colors cursor-pointer"
      >
        <span className="w-[5px] h-[5px] rounded-full bg-transparent border border-text-tertiary flex-shrink-0" />
        {placeholder || 'Añadir…'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-surface-raised border border-border">
      <span className="w-[5px] h-[5px] rounded-full bg-text-tertiary flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setText(''); setFocus(false); } }}
        onBlur={() => { if (!text.trim()) setFocus(false); }}
        placeholder={placeholder || 'Añadir…'}
        className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary"
      />
      <button type="button" onClick={handleSubmit} className="text-text-tertiary hover:text-text-secondary text-xs px-1" tabIndex={-1}>&#9166;</button>
    </div>
  );
}
