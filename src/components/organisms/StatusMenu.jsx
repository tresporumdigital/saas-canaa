import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from '../atoms/Icon.jsx';
import { statusVariant } from '../../lib/status.js';

/**
 * Organismo: badge de status que vira botão — abre a lista de status pré-definidos
 * e chama onChange(novoStatus). Sem `options` (ou com 1 só), renderiza um badge comum.
 *
 * A lista usa posição `fixed` calculada a partir do botão para não ser cortada pelo
 * overflow da tabela.
 */
export default function StatusMenu({ value, options = [], onChange, disabled, title = 'Alterar status' }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  const place = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const width = 200;
    const left = Math.min(b.left, window.innerWidth - width - 12);
    const below = window.innerHeight - b.bottom;
    const openUp = below < 240 && b.top > below;
    setCoords({
      left: Math.max(12, left),
      top: openUp ? undefined : b.bottom + 6,
      bottom: openUp ? window.innerHeight - b.top + 6 : undefined,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (btnRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open, close]);

  const choices = options.filter(Boolean);

  if (disabled || choices.length <= 1) {
    return <span className={`badge badge-${statusVariant(value)}`}>{value}</span>;
  }

  const pick = (e, next) => {
    e.stopPropagation();
    close();
    if (next !== value) onChange?.(next);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`badge badge-${statusVariant(value)} badge-btn`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        {value}
        <Icon name="chevron-down" size={12} />
      </button>
      {open && coords && (
        <div
          ref={listRef}
          className="status-menu-list"
          role="listbox"
          style={{ left: coords.left, top: coords.top, bottom: coords.bottom, width: coords.width }}
          onClick={(e) => e.stopPropagation()}
        >
          {choices.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={o === value}
              className={o === value ? 'active' : ''}
              onClick={(e) => pick(e, o)}
            >
              <span className={`status-dot badge-${statusVariant(o)}`} />
              {o}
              {o === value ? <Icon name="check" size={13} className="status-menu-check" /> : null}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
