import { useEffect } from 'react';
import Icon from '../atoms/Icon.jsx';

// Organismo: painel deslizante pela direita.
export function Drawer({ title, onClose, children, actions }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h3>{title}</h3>
          <div className="row" style={{ gap: 'var(--space-2)' }}>
            {actions}
            <button className="icon-btn" onClick={onClose} aria-label="Fechar"><Icon name="x" size={16} /></button>
          </div>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;
