// Molécula: lista de definição (ficha "rótulo → valor").
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

export default DefList;
