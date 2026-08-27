import { useEffect } from 'react';
import Icon from './Icon.jsx';
import { Button } from './Primitives.jsx';

const ALERT_ICON = { info: 'bell', success: 'check-circle', warning: 'doc', danger: 'x' };

export function Alert({ variant = 'info', title, children }) {
  return (
    <div className={`alert alert-${variant}`}>
      <Icon name={ALERT_ICON[variant]} />
      <div>
        {title ? <strong>{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon = 'grid', title, children, action }) {
  return (
    <div className="empty-state">
      <div className="ic-wrap"><Icon name={icon} /></div>
      <h4>{title}</h4>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 12, radius, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="stack gap-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="row" style={{ alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0' }}>
          <Skeleton width={38} height={38} radius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width={`${50 + (i % 3) * 12}%`} height={12} style={{ marginBottom: 8 }} />
            <Skeleton width={`${30 + (i % 2) * 10}%`} height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

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

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tab-item ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Trilha">
      {items.map((it, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 ? <span className="sep">/</span> : null}
          {it.to && i < items.length - 1
            ? <a href={`#${it.to}`}>{it.label}</a>
            : <span className={i === items.length - 1 ? 'current' : undefined}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
