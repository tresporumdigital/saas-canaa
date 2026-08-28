import Icon from '../atoms/Icon.jsx';

// Molécula: estado vazio (ícone + título + texto + ação).
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

export default EmptyState;
