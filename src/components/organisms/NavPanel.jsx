import { NavLink } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';

// Organismo: painel de labels do grupo ativo.
export default function NavPanel({ group }) {
  if (!group) return <aside className="nav-panel" />;
  return (
    <aside className="nav-panel" aria-label={`Módulos de ${group.label}`}>
      <div className="panel-title">{group.label}</div>
      <ul>
        {group.modules.map((m) => (
          <li key={m.path}>
            <NavLink to={m.path} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={m.icon} />
              {m.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
