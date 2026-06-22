import { useState, useRef, useEffect } from 'react';

export default function AddItemInput({ sectionId, onAdd, placeholder }) {
  const [text, setText] = useState('');
  const [focus, setFocus] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (focus && inputRef.current) inputRef.current.focus();
  }, [focus]);

  function handleSubmit() {
    const val = text.trim();
    if (!val) return;
    onAdd(sectionId, val);
    setText('');
    inputRef.current?.focus();
  }

  if (!focus) {
    return (
      <button
        type="button"
        onClick={() => setFocus(true)}
        className="flex items-center gap-2 w-full px-3 py-1.5 rounded-sm text-sm text-text-tertiary hover:text-text-secondary hover:bg-surface-raised transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 2v10M2 7h10" strokeLinecap="round" />
        </svg>
        {placeholder || 'Añadir item…'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-raised border border-border">
      <span className="w-[18px] h-[18px] rounded-[5px] border border-border-light flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') { setText(''); setFocus(false); }
        }}
        onBlur={() => { if (!text.trim()) setFocus(false); }}
        placeholder={placeholder || 'Añadir item…'}
        className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="text-text-tertiary hover:text-text-secondary text-xs px-1"
        tabIndex={-1}
      >
        &#9166;
      </button>
    </div>
  );
}
