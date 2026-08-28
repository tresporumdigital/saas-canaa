import Icon from '../atoms/Icon.jsx';
import { money } from '../../lib/format.js';

// Organismos de domínio: linha do tempo, cobertura, aging e documento para impressão.

/** steps: [{ label, at?, by?, state: 'done'|'current'|'todo' }] */
export function Timeline({ steps = [] }) {
  return (
    <div className="timeline">
      {steps.map((s, i) => (
        <div key={i} className={`tl-item ${s.state || 'todo'}`}>
          <div className="tl-dot"><span className="d" /><span className="line" /></div>
          <div className="tl-body">
            <div className="t1">{s.label}</div>
            {(s.at || s.by) && <div className="t2">{[s.at, s.by].filter(Boolean).join(' · ')}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/** checks: [{ label, state: 'ok'|'warn'|'bad', detail? }] */
export function CoverageBanner({ checks = [] }) {
  const icon = { ok: 'check', warn: 'alert', bad: 'x' };
  return (
    <div className="coverage">
      {checks.map((c, i) => (
        <div key={i} className={`cov-row ${c.state}`}>
          <span className="ic"><Icon name={icon[c.state]} /></span>
          <span><strong>{c.label}</strong>{c.detail ? ` — ${c.detail}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

/** buckets: [{ label, value }] em ordem de severidade crescente */
export function AgingBars({ buckets = [] }) {
  const total = Math.max(1, buckets.reduce((s, b) => s + b.value, 0));
  const cls = ['', '', 'w1', 'w2', 'w2'];
  return (
    <div className="aging">
      {buckets.map((b, i) => (
        <div key={i} className="ag-row">
          <span>{b.label}</span>
          <span className="ag-track"><span className={`ag-fill ${cls[i] || 'w2'}`} style={{ width: `${(b.value / total) * 100}%` }} /></span>
          <span className="ag-val">{money(b.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function PrintDocument({ kind = 'Documento', numero, children }) {
  return (
    <div className="print-doc">
      <div className="pd-head">
        <div className="pd-brand">
          Funerária Canaã
          <small>Assistência familiar · CNPJ 12.345.678/0001-90</small>
        </div>
        <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{kind}</div>
          {numero ? <div>Nº {numero}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
