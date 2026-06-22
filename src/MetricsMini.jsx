import { useState } from 'react';

export default function MetricsMini({ metrics, onUpdateMetric }) {
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState('');

  function handleSave(id) {
    const n = parseInt(val, 10);
    if (!isNaN(n)) onUpdateMetric(id, n);
    setEditing(null);
  }

  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-1 px-4 py-3 border-b border-border">
      {metrics.map(m => {
        const full = m.current >= m.target;
        const partial = m.current > 0 && !full;
        return (
          <div key={m.id} className="flex justify-between items-center text-xs">
            <span className="text-text-tertiary">{m.label}</span>
            {editing === m.id ? (
              <input
                type="number"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(m.id); if (e.key === 'Escape') setEditing(null); }}
                onBlur={() => handleSave(m.id)}
                className="w-12 bg-surface border border-border rounded-sm px-1 py-0.5 text-xs text-text-primary text-right outline-none"
                autoFocus
                min={0}
              />
            ) : (
              <span
                className={`font-medium cursor-pointer hover:opacity-80 ${
                  full ? 'text-green-500' : partial ? 'text-amber-400' : 'text-text-secondary'
                }`}
                onClick={() => { setVal(String(m.current)); setEditing(m.id); }}
              >
                {m.current}/{m.target}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
