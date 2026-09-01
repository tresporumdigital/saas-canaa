import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/templates/AppLayout.jsx';
import RequireAuth from './components/organisms/RequireAuth.jsx';

import AuthPage from './pages/auth/AuthPage.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import ClientesList from './pages/clientes/ClientesList.jsx';
import ClienteDetail from './pages/clientes/ClienteDetail.jsx';
import ParceirosList from './pages/parceiros/ParceirosList.jsx';
import ParceiroDetail from './pages/parceiros/ParceiroDetail.jsx';
import ObitosList from './pages/obitos/ObitosList.jsx';
import ObitoDetail from './pages/obitos/ObitoDetail.jsx';
import GuiasList from './pages/guias/GuiasList.jsx';
import GuiaDetail from './pages/guias/GuiaDetail.jsx';
import PlanosHome from './pages/planos/PlanosHome.jsx';
import ContratarForm from './pages/planos/ContratarForm.jsx';
import ContratoDetail from './pages/planos/ContratoDetail.jsx';
import CarnesHome from './pages/carnes/CarnesHome.jsx';
import Pagamentos from './pages/pagamentos/Pagamentos.jsx';
import FinanceiroHome from './pages/financeiro/FinanceiroHome.jsx';
import EmprestimosHome from './pages/emprestimos/EmprestimosHome.jsx';
import UnidadeHistorico from './pages/emprestimos/UnidadeHistorico.jsx';
import EquipamentosVendas from './pages/equipamentos/EquipamentosVendas.jsx';
import NotasFiscais from './pages/notas/NotasFiscais.jsx';
import LeadsHome from './pages/leads/LeadsHome.jsx';
import PortalParceiro from './pages/portal/PortalParceiro.jsx';
import Backups from './pages/backups/Backups.jsx';
import Configuracoes from './pages/config/Configuracoes.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* Rota pública: tela inicial de acesso. */}
      <Route path="/login" element={<AuthPage />} />

      {/* Tudo abaixo exige sessão; sem login, RequireAuth manda para /login. */}
      <Route
        element={(
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        )}
      >
        <Route index element={<Dashboard />} />

        <Route path="clientes" element={<ClientesList />} />
        <Route path="clientes/:id" element={<ClienteDetail />} />

        <Route path="parceiros" element={<ParceirosList />} />
        <Route path="parceiros/:id" element={<ParceiroDetail />} />

        <Route path="obitos" element={<ObitosList />} />
        <Route path="obitos/:id" element={<ObitoDetail />} />

        <Route path="guias" element={<GuiasList />} />
        <Route path="guias/:id" element={<GuiaDetail />} />

        <Route path="planos" element={<PlanosHome />} />
        <Route path="planos/contratar" element={<ContratarForm />} />
        <Route path="planos/contratos/:id" element={<ContratoDetail />} />

        <Route path="carnes" element={<CarnesHome />} />
        <Route path="pagamentos" element={<Pagamentos />} />
        <Route path="financeiro" element={<FinanceiroHome />} />

        <Route path="emprestimos" element={<EmprestimosHome />} />
        <Route path="emprestimos/unidade/:patrimonio" element={<UnidadeHistorico />} />
        <Route path="equipamentos" element={<EquipamentosVendas />} />
        <Route path="notas-fiscais" element={<NotasFiscais />} />

        <Route path="leads" element={<LeadsHome />} />
        <Route path="portal-parceiro" element={<PortalParceiro />} />
        <Route path="backups" element={<Backups />} />
        <Route path="configuracoes" element={<Configuracoes />} />

        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
