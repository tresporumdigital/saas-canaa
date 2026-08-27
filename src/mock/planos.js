// Catálogo de produtos de plano (RF-31).
export const planosProduto = [
  {
    id: 'PL-ESS', nome: 'Plano Essencial', valorMensal: 89.9, carenciaDias: 90,
    limiteDependentes: 3, reajuste: 'IPCA anual',
    coberturas: ['Urna padrão', 'Preparação do corpo', 'Velório 12h', 'Sepultamento', 'Documentação'],
  },
  {
    id: 'PL-FAM', nome: 'Plano Família', valorMensal: 149.9, carenciaDias: 90,
    limiteDependentes: 6, reajuste: 'IPCA anual',
    coberturas: ['Urna semiluxo', 'Preparação do corpo', 'Velório 24h', 'Translado até 100km', 'Sepultamento ou cremação', 'Documentação', 'Assistência 24h'],
  },
  {
    id: 'PL-SEN', nome: 'Plano Sênior', valorMensal: 119.9, carenciaDias: 120,
    limiteDependentes: 2, reajuste: 'IPCA anual + faixa etária',
    coberturas: ['Urna semiluxo', 'Preparação do corpo', 'Velório 24h', 'Sepultamento', 'Documentação', 'Assistência 24h'],
  },
  {
    id: 'PL-PREM', nome: 'Plano Premium', valorMensal: 229.9, carenciaDias: 60,
    limiteDependentes: 8, reajuste: 'IPCA anual',
    coberturas: ['Urna luxo', 'Preparação e tanatopraxia', 'Velório 24h com ornamentação', 'Translado nacional', 'Sepultamento ou cremação', 'Documentação completa', 'Assistência 24h', 'Coroa de flores'],
  },
];

export const planoById = (id) => planosProduto.find((p) => p.id === id);
