import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { useRole } from '../../context/RoleContext.jsx';

// Menu de navegação para telas pequenas (drawer vindo da esquerda).
// Lista todos os grupos e módulos visíveis para o perfil ativo, além do
// seletor de perfil — o trilho/painel fixos ficam ocultos no mobile.
export default function MobileNav({ groups, onClose }) {
  const { role, roles, setRoleId } = useRole();
  const navigate = useNavigate();

  const pickRole = (id) => {
    setRoleId(id);
    onClose();
    navigate(id === 'parceiro' ? '/portal-parceiro' : '/');
  };

  return (
    <div className="mnav-overlay" onClick={onClose}>
      <nav className="mnav" onClick={(e) => e.stopPropagation()} aria-label="Menu de navegação">
        <div className="mnav-head">
          <span className="brand">Canaã</span>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar menu"><Icon name="x" size={16} /></button>
        </div>

        <div className="mnav-body">
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
        </div>
      </nav>
    </div>
  );
}
