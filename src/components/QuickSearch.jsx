import { useState, useEffect, useRef } from 'react';

export default function QuickSearch({ projects, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const filtered = query.trim()
    ? projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : projects;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i+1, filtered.length-1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i-1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIdx]) {
        onSelect(filtered[selectedIdx].id);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filtered, selectedIdx, onSelect, onClose]);

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIdx];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  return (
    <div className="fixed inset-0 z-[300]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-raised border border-border rounded-[12px] shadow-lg animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5.5" /><path d="M11 11l3.5 3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            placeholder="Buscar proyecto…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary"
          />
          <span className="text-[10px] text-text-tertiary bg-surface px-1.5 py-0.5 rounded">ESC</span>
        </div>
        <div ref={listRef} className="max-h-[240px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-text-tertiary">Sin resultados</div>
          ) : filtered.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors ${
                i === selectedIdx ? 'bg-surface-hover text-text-primary' : 'text-text-secondary hover:bg-surface-hover'
              }`}
              onClick={() => { onSelect(p.id); onClose(); }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                style={{ background: STATUS_DOT[p.status] || '#6b7280' }} />
              <span>{p.name}</span>
              <span className="ml-auto text-[11px] text-text-tertiary">{p.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STATUS_DOT = {
  activo:'#22c55e', esperando:'#f59e0b', esperando_contrato:'#f59e0b',
  standby:'#6b7280', cerrado:'#ef4444', estrategico:'#8b5cf6',
  prospecto:'#3b82f6', optimizado:'#06b6d4', terminado:'#22c55e',
  mv_terminado:'#8b5cf6', pendientes:'#6b7280',
};
