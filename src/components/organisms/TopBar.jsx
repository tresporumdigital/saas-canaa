import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';
import UserMenu from './UserMenu.jsx';

// Organismo: barra superior (busca global, perfil simulado, usuário logado).
export default function TopBar({ onOpenMenu }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/clientes?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="app-topbar">
      <button className="icon-btn only-mobile" onClick={onOpenMenu} aria-label="Abrir menu">
        <Icon name="menu" size={18} />
      </button>
      <span className="brand">Canaã</span>
      <form className="search hide-mobile" onSubmit={submit} role="search">
        <Icon name="search" size={15} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente, contrato ou processo…"
          aria-label="Busca global"
        />
      </form>
      <div className="spacer" />
      <div className="actions">
        <button className="icon-btn hide-mobile" aria-label="Notificações"><Icon name="bell" size={16} /></button>
        <RoleSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
