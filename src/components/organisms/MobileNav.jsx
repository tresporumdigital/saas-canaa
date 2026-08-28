import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';
import { useRole } from '../../context/RoleContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Organismo: navegação para telas pequenas (drawer da esquerda). Lista grupos/módulos
// visíveis ao perfil ativo, o seletor de perfil e a saída da conta.
export default function MobileNav({ groups, onClose }) {
  const { role, roles, setRoleId } = useRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const pickRole = (id) => {
    setRoleId(id);
    onClose();
    navigate(id === 'parceiro' ? '/portal-parceiro' : '/');
  };

  const sair = () => {
    onClose();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mnav-overlay" onClick={onClose}>
      <nav className="mnav" onClick={(e) => e.stopPropagation()} aria-label="Menu de navegação">
        <div className="mnav-head">
          <span className="brand">Canaã</span>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar menu"><Icon name="x" size={16} /></button>
        </div>

        <div className="mnav-body">
          {user && (
            <div className="mnav-group">
              <div className="mnav-section-title">Conta</div>
              <div className="mnav-user">
                <span className="avatar sm">{user.initials}</span>
                <span className="mnav-user-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </span>
              </div>
            </div>
          )}

          <div className="mnav-group">
            <div className="mnav-section-title">Perfil de acesso</div>
            <div className="mnav-list">
              {roles.map((r) => (
                <button
                  key={r.id}
                  className={`mnav-item ${r.id === role.id ? 'active' : ''}`}
                  onClick={() => pickRole(r.id)}
                >
                  <span className="avatar xs">{r.avatar}</span>
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.id} className="mnav-group">
              <div className="mnav-section-title">{g.label}</div>
              <ul className="mnav-list">
                {g.modules.map((m) => (
                  <li key={m.path}>
                    <NavLink
                      to={m.path}
                      end={m.end}
                      onClick={onClose}
                      className={({ isActive }) => `mnav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon name={m.icon} size={16} />
                      {m.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mnav-group">
            <div className="mnav-list">
              <button className="mnav-item" onClick={sair}>
                <Icon name="logout" size={16} />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
