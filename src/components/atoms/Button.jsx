import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Spinner from './Spinner.jsx';

/**
 * Átomo: botão. Variantes de superfície (primary/secondary/ghost/danger) + tamanhos.
 * `loading` desabilita e troca o ícone por um spinner (usado no fluxo de autenticação).
 */
export function Button({
  variant = 'secondary', size, icon, iconRight, to, href, loading = false,
  disabled, block, children, className = '', ...rest
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '',
    className,
  ].filter(Boolean).join(' ');
  const inner = (
    <>
      {loading ? <Spinner /> : icon ? <Icon name={icon} /> : null}
      {children}
      {!loading && iconRight ? <Icon name={iconRight} /> : null}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button className={cls} disabled={disabled || loading} {...rest}>{inner}</button>;
}

export default Button;
