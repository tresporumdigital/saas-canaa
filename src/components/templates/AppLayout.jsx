import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import IconSprite from '../atoms/IconSprite.jsx';
import NavRail from '../organisms/NavRail.jsx';
import NavPanel from '../organisms/NavPanel.jsx';
import TopBar from '../organisms/TopBar.jsx';
import MobileNav from '../organisms/MobileNav.jsx';
import { useRole } from '../../context/RoleContext.jsx';
import { visibleNav, findGroupForPath } from '../../routes.jsx';

// Template: casca autenticada (trilho + painel + topo + conteúdo).
export default function AppLayout() {
  const { roleId } = useRole();
  const location = useLocation();
  const groups = visibleNav(roleId);
  const [groupId, setGroupId] = useState(() => findGroupForPath(location.pathname, roleId).id);
  const [menuOpen, setMenuOpen] = useState(false);

  // Ao navegar (inclusive por links do painel), sincroniza o grupo ativo com a rota.
  useEffect(() => {
    setGroupId(findGroupForPath(location.pathname, roleId).id);
    setMenuOpen(false);
  }, [location.pathname, roleId]);

  // Fecha o menu mobile ao voltar para a largura de desktop.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const mq = window.matchMedia('(min-width: 861px)');
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [menuOpen]);

  const activeGroup = groups.find((g) => g.id === groupId) || groups[0];

  return (
    <>
      <IconSprite />
      <div className="app-shell">
        <NavRail groups={groups} activeGroupId={activeGroup?.id} onPickGroup={(g) => setGroupId(g.id)} />
        <NavPanel group={activeGroup} />
        <div className="app-main">
          <TopBar onOpenMenu={() => setMenuOpen(true)} />
          <main className="app-content">
            <div className="app-content-inner">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {menuOpen && <MobileNav groups={groups} onClose={() => setMenuOpen(false)} />}
    </>
  );
}
