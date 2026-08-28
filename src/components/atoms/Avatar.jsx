import { initials as toInitials } from '../../lib/format.js';

// Átomo: avatar com iniciais. `src` opcional exibe a foto (ex.: conta Google).
export function Avatar({ name, src, size = 'sm', className = '' }) {
  const cls = `avatar ${size} ${className}`.trim();
  if (src) return <img className={cls} src={src} alt="" aria-hidden="true" />;
  return <span className={cls} aria-hidden="true">{toInitials(name)}</span>;
}

export default Avatar;
