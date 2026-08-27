// Gerador de carnês (RF-73..RF-79).
export const carnes = [
  { id: 'CAR-2026-0018', contratoId: 'CTR-2026-0001', clienteNome: 'Marina Alves Costa', competenciaInicial: 'set/25', parcelas: 12, valorParcela: 149.9, geradoEm: '2025-08-20T10:12:00', enviadoEm: '2025-08-20T10:13:00', canalEnvio: 'E-mail', lote: 'Lote anual 2025/2026' },
  { id: 'CAR-2026-0017', contratoId: 'CTR-2026-0003', clienteNome: 'Aparecida Nogueira Lima', competenciaInicial: 'set/25', parcelas: 12, valorParcela: 149.9, geradoEm: '2025-08-20T10:12:00', enviadoEm: '2025-08-20T10:13:00', canalEnvio: 'E-mail', lote: 'Lote anual 2025/2026' },
  { id: 'CAR-2026-0016', contratoId: 'CTR-2026-0010', clienteNome: 'Antônio Carlos Ferreira', competenciaInicial: 'set/25', parcelas: 12, valorParcela: 149.9, geradoEm: '2025-08-20T10:12:00', enviadoEm: '2025-08-20T10:14:00', canalEnvio: 'E-mail', lote: 'Lote anual 2025/2026' },
  { id: 'CAR-2026-0015', contratoId: 'CTR-2026-0002', clienteNome: 'José Ribeiro da Silva', competenciaInicial: 'ago/26', parcelas: 6, valorParcela: 119.9, geradoEm: '2026-07-22T16:50:00', enviadoEm: '2026-07-22T16:51:00', canalEnvio: 'E-mail', lote: 'Reemissão — acordo de dívida' },
  { id: 'CAR-2026-0014', contratoId: 'CTR-2026-0016', clienteNome: 'Sebastião Oliveira Cruz', competenciaInicial: 'jul/26', parcelas: 3, valorParcela: 89.9, geradoEm: '2026-06-28T09:20:00', enviadoEm: null, canalEnvio: 'E-mail', lote: 'Reemissão — parcelas avulsas' },
  { id: 'CAR-2026-0013', contratoId: 'CTR-2026-0006', clienteNome: 'Roberto Carlos Antunes', competenciaInicial: 'out/25', parcelas: 12, valorParcela: 229.9, geradoEm: '2025-09-25T11:00:00', enviadoEm: '2025-09-25T11:01:00', canalEnvio: 'E-mail', lote: 'Lote anual 2025/2026' },
  { id: 'CAR-2026-0012', contratoId: 'CTR-2026-0007', clienteNome: 'Vera Lúcia Prado', competenciaInicial: 'jan/26', parcelas: 12, valorParcela: 149.9, geradoEm: '2025-12-18T14:30:00', enviadoEm: '2025-12-18T14:31:00', canalEnvio: 'E-mail', lote: 'Lote anual 2026' },
  { id: 'CAR-2026-0011', contratoId: 'CTR-2026-0013', clienteNome: 'Cleuza Maria dos Santos', competenciaInicial: 'jan/26', parcelas: 12, valorParcela: 149.9, geradoEm: '2025-12-18T14:30:00', enviadoEm: '2025-12-18T14:33:00', canalEnvio: 'E-mail', lote: 'Lote anual 2026' },
  { id: 'CAR-2026-0010', contratoId: 'CTR-2026-0014', clienteNome: 'Wilson Batista Rocha', competenciaInicial: 'mai/26', parcelas: 12, valorParcela: 229.9, geradoEm: '2026-04-20T10:00:00', enviadoEm: '2026-04-20T10:02:00', canalEnvio: 'E-mail', lote: 'Lote mensal abr/2026' },
  { id: 'CAR-2026-0009', contratoId: 'CTR-2026-0017', clienteNome: 'Rosângela Martins Dias', competenciaInicial: 'ago/26', parcelas: 12, valorParcela: 149.9, geradoEm: '2026-07-30T15:45:00', enviadoEm: '2026-07-30T15:46:00', canalEnvio: 'E-mail', lote: 'Lote mensal jul/2026' },
  { id: 'CAR-2026-0008', contratoId: 'CTR-2026-0020', clienteNome: 'Edson Luís Carvalho', competenciaInicial: 'mar/26', parcelas: 12, valorParcela: 149.9, geradoEm: '2026-02-14T09:10:00', enviadoEm: '2026-02-14T09:12:00', canalEnvio: 'E-mail', lote: 'Lote mensal fev/2026' },
  { id: 'CAR-2026-0007', contratoId: 'CTR-2026-0005', clienteNome: 'Terezinha de Jesus Farias', competenciaInicial: 'jan/26', parcelas: 12, valorParcela: 119.9, geradoEm: '2025-12-18T14:30:00', enviadoEm: '2025-12-18T14:35:00', canalEnvio: 'E-mail', lote: 'Lote anual 2026' },
];

export const carneById = (id) => carnes.find((c) => c.id === id);
export const carnesDoContrato = (contratoId) => carnes.filter((c) => c.contratoId === contratoId);
