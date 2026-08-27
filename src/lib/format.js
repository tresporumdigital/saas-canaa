// Formatadores pt-BR. Sem dependências externas.

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const int = new Intl.NumberFormat('pt-BR');
const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export const money = (v) => brl.format(Number(v || 0));
export const number = (v) => int.format(Number(v || 0));
export const percent = (v) => pct.format(Number(v || 0));

export function date(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('pt-BR');
}

export function dateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function cpf(v) {
  const s = String(v || '').replace(/\D/g, '').padStart(11, '0').slice(0, 11);
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function cnpj(v) {
  const s = String(v || '').replace(/\D/g, '').padStart(14, '0').slice(0, 14);
  return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function phone(v) {
  const s = String(v || '').replace(/\D/g, '');
  if (s.length === 11) return s.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (s.length === 10) return s.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return String(v || '');
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// dias entre uma data e hoje (referência do protótipo: 27/08/2026)
export const TODAY = new Date('2026-08-27T09:00:00');

export function daysFromToday(iso) {
  const d = new Date(iso);
  return Math.round((d - TODAY) / 86400000);
}

export function relativeDays(iso) {
  const n = daysFromToday(iso);
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  if (n === -1) return 'ontem';
  if (n < 0) return `há ${Math.abs(n)} dias`;
  return `em ${n} dias`;
}
