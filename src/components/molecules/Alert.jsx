import Icon from '../atoms/Icon.jsx';

const ALERT_ICON = { info: 'bell', success: 'check-circle', warning: 'alert', danger: 'alert' };

// Molécula: aviso contextual em bloco.
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

export default Alert;
