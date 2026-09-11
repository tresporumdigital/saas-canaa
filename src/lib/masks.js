// Máscaras de digitação (pt-BR). Cada função recebe o valor cru do input e devolve
// o texto já formatado, progressivamente, conforme o usuário digita.

export function maskCPF(v) {
  return String(v || '')
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCNPJ(v) {
  return String(v || '')
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// RG não tem padrão nacional único — usamos o formato mais comum (XX.XXX.XXX-D),
// aceitando X como dígito verificador.
export function maskRG(v) {
  return String(v || '')
    .replace(/[^\dXx]/g, '')
    .slice(0, 9)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})([\dXx])$/, '$1-$2')
    .toUpperCase();
}

export function maskCEP(v) {
  return String(v || '')
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function maskPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

// Máscara monetária "de calculadora": os dígitos digitados viram centavos.
export function maskMoney(v) {
  const digits = String(v || '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  const cents = digits === '' ? 0 : Number(digits);
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function moneyToNumber(v) {
  const digits = String(v || '').replace(/\D/g, '');
  return digits === '' ? 0 : Number(digits) / 100;
}

// Converte um número (reais) para o texto já mascarado, ex.: 410 -> "R$ 410,00".
export function numberToMoneyInput(n) {
  return maskMoney(String(Math.round(Number(n || 0) * 100)));
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

export function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '');
}
