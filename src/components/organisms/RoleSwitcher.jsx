import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext.jsx';
import Icon from '../atoms/Icon.jsx';

// Organismo: alterna o perfil de acesso simulado (recurso de protótipo).
export default function RoleSwitcher() {
  const { role, roles, setRoleId } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (id) => {
    setRoleId(id);
    setOpen(false);
    navigate(id === 'parceiro' ? '/portal-parceiro' : '/');
  };

  return (
    <div className="role-switcher" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <span className="avatar xs">{role.avatar}</span>
        <span className="rs-name">{role.name}</span>
        <Icon name="chevron-down" size={13} />
      </button>
      {open && (
        <div className="menu" role="menu">
          {roles.map((r) => (
            <button key={r.id} className={r.id === role.id ? 'active' : ''} onClick={() => pick(r.id)} role="menuitem">
              <span className="r-name">{r.name}</span>
              <span className="r-desc">{r.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
