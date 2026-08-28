// Molécula: trilha de navegação. items: [{ label, to? }] — último item é o atual.
export function Breadcrumb({ items = [] }) {
  return (
    <nav className="breadcrumb" aria-label="Trilha">
      {items.map((it, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 ? <span className="sep">/</span> : null}
          {it.to && i < items.length - 1
            ? <a href={`#${it.to}`}>{it.label}</a>
            : <span className={i === items.length - 1 ? 'current' : undefined}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
