import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import IconSprite from '../ui/IconSprite.jsx';
import NavRail from './NavRail.jsx';
import NavPanel from './NavPanel.jsx';
import TopBar from './TopBar.jsx';
import { useRole } from '../../context/RoleContext.jsx';
import { visibleNav, findGroupForPath } from '../../routes.jsx';

export default function AppLayout() {
  const { roleId } = useRole();
  const location = useLocation();
  const groups = visibleNav(roleId);
  const [groupId, setGroupId] = useState(() => findGroupForPath(location.pathname, roleId).id);

  // Ao navegar (inclusive por links do painel), sincroniza o grupo ativo com a rota.
  useEffect(() => {
    setGroupId(findGroupForPath(location.pathname, roleId).id);
  }, [location.pathname, roleId]);

  const activeGroup = groups.find((g) => g.id === groupId) || groups[0];

  return (
    <>
      <IconSprite />
      <div className="app-shell">
        <NavRail groups={groups} activeGroupId={activeGroup?.id} onPickGroup={(g) => setGroupId(g.id)} />
        <NavPanel group={activeGroup} />
        <div className="app-main">
          <TopBar />
          <main className="app-content">
            <div className="app-content-inner">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
