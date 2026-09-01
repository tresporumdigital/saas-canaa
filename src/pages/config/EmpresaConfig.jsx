import { useState } from 'react';
import { PageHeader } from '../../components/index.js';
import {
  Card, DataTable, Badge, Button, DefList, Modal,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { empresa, unidades } from '../../mock/sistema.js';

const enderecoLinha = (e) =>
  `${e.logradouro}, ${e.numero}${e.complemento ? ` — ${e.complemento}` : ''} · ${e.bairro} · ${e.cidade}/${e.uf} · CEP ${e.cep}`;

export default function EmpresaConfig() {
  const { toast } = useToast();
  const [unidade, setUnidade] = useState(null);

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Empresa e Unidades' }]}
        title="Empresa e Unidades"
        subtitle="Dados cadastrais da matriz e as unidades (filiais e escritórios) da Funerária Canaã."
        actions={<Button variant="secondary" icon="pencil" onClick={() => toast('Edição dos dados da empresa (simulação).')}>Editar dados</Button>}
      />

      <Card title="Dados da empresa">
        <DefList items={[
          { label: 'Razão social', value: empresa.razaoSocial },
          { label: 'Nome fantasia', value: empresa.nomeFantasia },
          { label: 'CNPJ', value: empresa.cnpj },
          { label: 'Inscrição estadual', value: empresa.inscricaoEstadual },
          { label: 'Inscrição municipal', value: empresa.inscricaoMunicipal },
          { label: 'Regime tributário', value: empresa.regimeTributario },
          { label: 'CNAE principal', value: empresa.cnae },
          { label: 'Endereço', value: enderecoLinha(empresa.endereco) },
          { label: 'Telefone', value: empresa.telefone },
          { label: 'E-mail', value: empresa.email },
          { label: 'Site', value: empresa.site },
          { label: 'Responsável legal', value: empresa.responsavelLegal },
          { label: 'Contabilidade', value: empresa.contador },
        ]} />
      </Card>

      <Card title={`Unidades (${unidades.length})`}>
        <DataTable
          rows={unidades}
          searchKeys={['nome', 'tipo', 'cidade', 'responsavel', 'cnpj']}
          searchPlaceholder="Buscar por unidade, tipo, cidade ou responsável…"
          onRowClick={(r) => setUnidade(r)}
          pageSize={10}
          columns={[
            { key: 'nome', header: 'Unidade', sortable: true },
            { key: 'tipo', header: 'Tipo', sortable: true, render: (r) => <Badge variant={r.tipo === 'Matriz' ? 'info' : 'neutral'}>{r.tipo}</Badge> },
            { key: 'cnpj', header: 'CNPJ' },
            { key: 'cidade', header: 'Cidade/UF', render: (r) => `${r.cidade}/${r.uf}` },
            { key: 'responsavel', header: 'Responsável', sortable: true },
            { key: 'telefone', header: 'Telefone' },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'Ativa' ? 'success' : 'neutral'}>{r.status}</Badge> },
          ]}
        />
      </Card>

      {unidade && (
        <Modal
          title={unidade.nome}
          onClose={() => setUnidade(null)}
          wide
          footer={<Button variant="secondary" type="button" onClick={() => setUnidade(null)}>Fechar</Button>}
        >
          <DefList items={[
            { label: 'Tipo', value: <Badge variant={unidade.tipo === 'Matriz' ? 'info' : 'neutral'}>{unidade.tipo}</Badge> },
            { label: 'Status', value: <Badge variant={unidade.status === 'Ativa' ? 'success' : 'neutral'}>{unidade.status}</Badge> },
            { label: 'CNPJ', value: unidade.cnpj },
            { label: 'Endereço', value: enderecoLinha(unidade.endereco) },
            { label: 'Responsável', value: unidade.responsavel },
            { label: 'Telefone', value: unidade.telefone },
            { label: 'E-mail', value: unidade.email },
            { label: 'Horário de funcionamento', value: unidade.horario },
            { label: 'Alvará de funcionamento', value: unidade.alvara },
            { label: 'Salas de velório', value: String(unidade.salasVelorio) },
            { label: 'Capela', value: unidade.capela ? 'Sim' : 'Não' },
          ]} />
        </Modal>
      )}
    </>
  );
}
