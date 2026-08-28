import { PageHeader } from '../../components/index.js';
import {
  Card, DataTable, Badge, Button, StatCard, DefList, Alert,
} from '../../components/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { backupConfig, backupExecucoes, ultimoBackup } from '../../mock/sistema.js';
import { dateTime, date } from '../../lib/format.js';
import { statusVariant } from '../../lib/status.js';

export default function Backups() {
  const { toast } = useToast();
  const falhas = backupExecucoes.filter((e) => e.status === 'Falha');

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Backups' }]}
        title="Backups Automáticos"
        subtitle="Backup diário automático do banco e dos arquivos anexados, com armazenamento externo criptografado e restauração testada."
        actions={<Button variant="secondary" icon="refresh" onClick={() => toast('Backup manual disparado (simulação).')}>Executar agora</Button>}
      />

      <div className="grid cols-3">
        <StatCard
          label="Último backup"
          value={ultimoBackup.status}
          icon={ultimoBackup.status === 'Sucesso' ? 'check-circle' : 'alert'}
          tone={ultimoBackup.status === 'Sucesso' ? 'success' : 'danger'}
          foot={dateTime(ultimoBackup.quando)}
        />
        <StatCard label="Falhas (últimos 20)" value={falhas.length} icon="alert" tone={falhas.length ? 'warning' : 'success'} />
        <StatCard label="RPO / RTO" value={`${backupConfig.rpo} / ${backupConfig.rto}`} icon="shield" tone="info" />
      </div>

      {falhas.length > 0 && (
        <Alert variant="warning" title="Houve falha de backup no período">
          {falhas.map((f) => `${f.id}: ${f.mensagem}`).join(' ')}
        </Alert>
      )}

      <Card title="Configuração">
        <DefList items={[
          { label: 'Destino', value: backupConfig.destino },
          { label: 'Janela de execução', value: backupConfig.janela },
          { label: 'Retenção', value: `${backupConfig.retencao.diarios} diários · ${backupConfig.retencao.semanais} semanais · ${backupConfig.retencao.mensais} mensais` },
          { label: 'RPO', value: backupConfig.rpo },
          { label: 'RTO', value: backupConfig.rto },
          { label: 'Último teste de restauração', value: date(backupConfig.ultimoTesteRestauracao) },
        ]} />
      </Card>

      <Card title="Histórico de execuções">
        <DataTable
          searchable={false}
          rows={backupExecucoes}
          pageSize={12}
          columns={[
            { key: 'id', header: 'Execução' },
            { key: 'quando', header: 'Quando', render: (r) => dateTime(r.quando) },
            { key: 'tipo', header: 'Tipo', render: (r) => <Badge variant="neutral">{r.tipo}</Badge> },
            { key: 'tamanho', header: 'Tamanho', align: 'right' },
            { key: 'duracao', header: 'Duração', align: 'right' },
            { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
          ]}
        />
      </Card>

      <Card title="Restauração">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
          Restauração completa a partir de um ponto de recuperação. Testada periodicamente com RPO ≤ 24h e RTO ≤ 4h.
        </p>
        <Button variant="secondary" onClick={() => toast('Solicitação de restauração registrada — requer confirmação do administrador (simulação).')}>
          Solicitar restauração
        </Button>
      </Card>
    </>
  );
}
