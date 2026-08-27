import { useMemo, useState } from 'react';
import Icon from './Icon.jsx';

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

/**
 * columns: [{ key, header, render?(row), sortable?, align?, sortValue?(row) }]
 * rows: array de objetos
 */
export default function DataTable({
  columns,
  rows,
  getKey = (r, i) => r.id ?? i,
  onRowClick,
  searchable = true,
  searchKeys,
  searchPlaceholder = 'Buscar…',
  pageSize = 8,
  toolbarExtra,
  initialQuery = '',
  emptyLabel = 'Nenhum registro encontrado.',
}) {
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState(null); // { key, dir }
  const [page, setPage] = useState(1);

  const keysForSearch = searchKeys || columns.map((c) => c.key);

  const filtered = useMemo(() => {
    let data = rows;
    const term = q.trim().toLowerCase();
    if (term) {
      data = data.filter((r) =>
        keysForSearch.some((k) => String(r[k] ?? '').toLowerCase().includes(term)),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      const val = col?.sortValue || ((r) => r[sort.key]);
      data = [...data].sort((a, b) => {
        const av = val(a); const bv = val(b);
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
        return sort.dir === 'asc'
          ? String(av).localeCompare(String(bv), 'pt-BR')
          : String(bv).localeCompare(String(av), 'pt-BR');
      });
    }
    return data;
  }, [rows, q, sort, columns, keysForSearch]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
    setPage(1);
  };

  return (
    <div>
      {(searchable || toolbarExtra) && (
        <div className="table-toolbar">
          {searchable && (
            <div className="search-inline">
              <Icon name="search" size={15} />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          <div className="spacer" />
          {toolbarExtra}
        </div>
      )}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={[c.align === 'right' ? 'num' : '', c.sortable ? 'sortable' : ''].filter(Boolean).join(' ')}
                  onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                >
                  {c.header}
                  {c.sortable && (
                    <span className="sort">
                      <Icon name={sort?.key === c.key && sort.dir === 'desc' ? 'chevron-up' : 'chevron-down'} size={11} />
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-7)' }}>{emptyLabel}</td></tr>
            ) : slice.map((r, i) => (
              <tr
                key={getKey(r, i)}
                className={onRowClick ? 'clickable' : ''}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'num' : ''}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>{filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}{q ? ` (filtrado de ${rows.length})` : ''}</span>
          <Pagination page={safePage} pages={pages} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}
