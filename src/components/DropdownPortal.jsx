<<<<<<< HEAD
import { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function DropdownPortal({ open, triggerRef, onClose, children, align = 'end' }) {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (!open) { setRect(null); return; }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setRect(r);
  }, [open, triggerRef]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useLayoutEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [open, onClose, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    function handle(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open || !rect) return null;

  const style = {
    position: 'fixed',
    left: align === 'end' ? `${rect.right}px` : `${rect.left}px`,
    top: `${rect.bottom + 4}px`,
    transform: align === 'end' ? 'translateX(-100%)' : undefined,
    zIndex: 200,
  };

  return createPortal(
    <div ref={ref} style={style} className="bg-surface-raised border border-border rounded-md shadow-lg py-1 min-w-[140px]">
      {children}
    </div>,
    document.body
  );
}
=======
import { useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function DropdownPortal({ open, triggerRef, onClose, children, align = 'end' }) {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (!open) { setRect(null); return; }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setRect(r);
  }, [open, triggerRef]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useLayoutEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [open, onClose, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    function handle(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open || !rect) return null;

  const style = {
    position: 'fixed',
    left: align === 'end' ? `${rect.right}px` : `${rect.left}px`,
    top: `${rect.bottom + 4}px`,
    transform: align === 'end' ? 'translateX(-100%)' : undefined,
    zIndex: 200,
  };

  return createPortal(
    <div ref={ref} style={style} className="bg-surface-raised border border-border rounded-md shadow-lg py-1 min-w-[140px]">
      {children}
    </div>,
    document.body
  );
}
>>>>>>> a73b4e1 (feat: re-inicialización de git)
