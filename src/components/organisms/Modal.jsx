import { useEffect } from 'react';
import Button from '../atoms/Button.jsx';

// Organismo: diálogo modal com overlay e fechamento por Esc / clique fora.
export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-card" style={wide ? { maxWidth: 620 } : undefined} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        {title ? <h4>{title}</h4> : null}
        <div className="modal-body">{children}</div>
        {footer ? <div className="btn-row">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', danger, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button size="sm" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button size="sm" variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm?.(); onClose?.(); }}>{confirmLabel}</Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}

export default Modal;
