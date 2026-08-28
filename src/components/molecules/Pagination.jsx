// Molécula: paginação numérica com reticências.
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const nums = [];
  const from = Math.max(1, Math.min(page - 1, pages - 2));
  const to = Math.min(pages, from + 2);
  for (let i = from; i <= to; i++) nums.push(i);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Página anterior">‹</button>
      {from > 1 ? <button className="page-btn" onClick={() => onPage(1)}>1</button> : null}
      {from > 2 ? <span className="page-btn" style={{ background: 'transparent' }}>…</span> : null}
      {nums.map((n) => (
        <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => onPage(n)}>{n}</button>
      ))}
      {to < pages - 1 ? <span className="page-btn" style={{ background: 'transparent' }}>…</span> : null}
      {to < pages ? <button className="page-btn" onClick={() => onPage(pages)}>{pages}</button> : null}
      <button className="page-btn" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Próxima página">›</button>
    </div>
  );
}

export default Pagination;
