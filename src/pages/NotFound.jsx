import { PageHeader } from '../components/index.js';
import { EmptyState, Button } from '../components/index.js';

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
