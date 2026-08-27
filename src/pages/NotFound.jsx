import PageHeader from '../components/layout/PageHeader.jsx';
import { EmptyState, Button } from '../components/ui/index.js';

export default function NotFound() {
  return (
    <>
      <PageHeader title="Página não encontrada" />
      <div className="card">
        <EmptyState icon="grid" title="Este endereço não existe no sistema" action={<Button variant="primary" to="/">Voltar ao painel</Button>}>
          Verifique o link ou use o menu lateral para navegar entre os módulos.
        </EmptyState>
      </div>
    </>
  );
}
