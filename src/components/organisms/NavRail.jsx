import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';

// Organismo: trilho de ícones (grupos de módulos).
export default function NavRail({ groups, activeGroupId, onPickGroup }) {
  const navigate = useNavigate();
  return (
    <nav className="nav-rail" aria-label="Grupos de módulos">
      <div className="logo-mark"><Icon name="check-circle" size={20} /></div>
      {groups.filter((g) => g.id !== 'config').map((g) => (
        <button
          key={g.id}
          className={`rail-btn ${activeGroupId === g.id ? 'active' : ''}`}
          onClick={() => onPickGroup(g)}
          title={g.label}
          aria-label={g.label}
        >
          <Icon name={g.icon} />
        </button>
      ))}
      <div className="rail-spacer" />
      <button className="rail-btn" title="Notificações" aria-label="Notificações" onClick={() => navigate('/')} style={{ position: 'relative' }}>
        <Icon name="bell" />
        <span className="dot-badge" />
      </button>
      {groups.filter((g) => g.id === 'config').map((g) => (
        <button
          key={g.id}
          className={`rail-btn ${activeGroupId === g.id ? 'active' : ''}`}
          onClick={() => onPickGroup(g)}
          title={g.label}
          aria-label={g.label}
        >
          <Icon name={g.icon} />
        </button>
      ))}
    </nav>
  );
}
