<<<<<<< HEAD
import { createContext, useContext } from 'react';

export const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ModalProvider');
  return ctx;
}
=======
import { createContext, useContext } from 'react';

export const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ModalProvider');
  return ctx;
}
>>>>>>> a73b4e1 (feat: re-inicialización de git)
