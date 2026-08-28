import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';
import Avatar from '../atoms/Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Organismo: identidade do usuário logado + menu com "Sair".
export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!user) return null;

  const sair = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-menu" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <Avatar name={user.name} src={user.photo} size="sm" />
        <span className="um-name hide-mobile">{user.name}</span>
        <Icon name="chevron-down" size={13} className="hide-mobile" />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="um-head">
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              {user.via === 'google' ? <span className="um-tag">conta Google</span> : null}
            </div>
          </div>
          <button onClick={sair} role="menuitem" className="um-signout">
            <Icon name="logout" size={15} />
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
