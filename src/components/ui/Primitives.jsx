import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { initials as toInitials } from '../../lib/format.js';

export function Button({ variant = 'secondary', size, icon, to, href, children, className = '', ...rest }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    className,
  ].filter(Boolean).join(' ');
  const inner = (
    <>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button className={cls} {...rest}>{inner}</button>;
}

export function Card({ title, action, children, className = '', pad = 'md', ...rest }) {
  return (
    <section className={`card ${pad === 'lg' ? 'pad-lg' : ''} ${className}`.trim()} {...rest}>
      {title ? (
        <div className="card-title">
          <span>{title}</span>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Tag({ children }) {
  return <span className="tag-chip">{children}</span>;
}

export function Avatar({ name, size = 'sm', className = '' }) {
  return <span className={`avatar ${size} ${className}`.trim()} aria-hidden="true">{toInitials(name)}</span>;
}

export function AvatarGroup({ names = [], size = 'sm', max = 4 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="avatar-group">
      {shown.map((n, i) => <Avatar key={i} name={n} size={size} />)}
      {extra > 0 ? <span className={`avatar ${size}`}>+{extra}</span> : null}
    </span>
  );
}

export function Bar({ value = 0 }) {
  return <div className="bar"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

// Colunas mini (sem libs). data: array de números.
export function Spark({ data = [] }) {
  const max = Math.max(1, ...data);
  const hiIdx = data.indexOf(Math.max(...data));
  return (
    <div className="spark" aria-hidden="true">
      {data.map((v, i) => (
        <i key={i} className={i === hiIdx ? 'hi' : ''} style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}

export function DefList({ items = [] }) {
  return (
    <dl className="dl">
      {items.map((it, i) => (
        <div key={i}>
          <dt>{it.label}</dt>
          <dd>{it.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
