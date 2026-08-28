// <Icon name="grid" /> -> usa o sprite renderizado em <IconSprite /> (template AppLayout / AuthLayout).
export default function Icon({ name, size, className = '', style, title }) {
  const s = size ? { width: size, height: size } : undefined;
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      style={{ ...s, ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <use href={`#ic-${name}`} />
    </svg>
  );
}
