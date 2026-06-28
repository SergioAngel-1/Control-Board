import { useState, useCallback, useRef } from 'react';
import { ConfirmContext } from '../hooks/useConfirm.js';
import AlertConfirm from './AlertConfirm.jsx';

export function ModalProvider({ children }) {
  const [modalProps, setModalProps] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Eliminar',
    cancelLabel: 'Cancelar',
    variant: 'danger',
  });
  const resolveRef = useRef(null);

  const confirm = useCallback(({ title, message, confirmLabel, cancelLabel, variant }) => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setModalProps({
        open: true,
        title,
        message,
        confirmLabel: confirmLabel || 'Eliminar',
        cancelLabel: cancelLabel || 'Cancelar',
        variant: variant || 'danger',
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setModalProps(s => ({ ...s, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setModalProps(s => ({ ...s, open: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertConfirm
        open={modalProps.open}
        title={modalProps.title}
        message={modalProps.message}
        confirmLabel={modalProps.confirmLabel}
        cancelLabel={modalProps.cancelLabel}
        variant={modalProps.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}
