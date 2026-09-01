import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../atoms/Icon.jsx';

let uid = 0;
const nextId = () => `f${++uid}`;

// Molécula base: label + controle + linha de ajuda/erro/sucesso.
export function Field({ label, hint, error, success, children, id }) {
  const fid = id || nextId();
  const state = error ? 'error' : success ? 'success' : '';
  const help = error || success || hint;
  return (
    <div className={`field ${state}`.trim()}>
      {label ? <label htmlFor={fid}>{label}</label> : null}
      {typeof children === 'function' ? children(fid) : children}
      {help ? <span className="help">{help}</span> : null}
    </div>
  );
}

export function Input({ label, hint, error, success, icon, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} success={success}>
      {(id) => (icon ? (
        <span className="input-affix">
          <Icon name={icon} size={16} />
          <input id={id} {...rest} />
        </span>
      ) : (
        <input id={id} {...rest} />
      ))}
    </Field>
  );
}

// Campo de senha com botão mostrar/ocultar.
export function PasswordInput({ label, hint, error, success, icon = 'lock', ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} success={success}>
      {(id) => (
        <span className="input-affix">
          <Icon name={icon} size={16} />
          <input id={id} type={show ? 'text' : 'password'} {...rest} />
          <button
            type="button"
            className="input-affix-btn"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            <Icon name={show ? 'eye-off' : 'eye'} size={16} />
          </button>
        </span>
      )}
    </Field>
  );
}

// Converte `children` (<option>) ou `options` (string | {value,label}) numa lista {value,label}.
function toChoices(options, children) {
  if (children != null) {
    const flat = [];
    const walk = (node) => {
      if (node == null || node === false || node === true) return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      if (node.type === 'option') {
        const label = node.props.children ?? '';
        const value = node.props.value ?? label;
        flat.push({ value: String(value), label });
        return;
      }
      if (node.props?.children) walk(node.props.children);
    };
    walk(children);
    return flat;
  }
  return (options || []).map((o) => (
    o && typeof o === 'object'
      ? { value: String(o.value), label: o.label ?? String(o.value) }
      : { value: String(o), label: String(o) }
  ));
}

/**
 * Select como pop-over dentro da identidade do sistema (sem <select> nativo).
 * Mantém a API antiga: `value`/`onChange({target:{value}})`, `options` ou `children` <option>.
 * Sem `label` renderiza só o gatilho (uso em barras de ferramentas).
 */
export function Select({
  label, hint, error, success, options = [], children,
  value, defaultValue, onChange, disabled, placeholder = 'Selecione…',
  className = '', id, ...rest
}) {
  const choices = useMemo(() => toChoices(options, children), [options, children]);
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(() => (
    defaultValue !== undefined ? String(defaultValue) : (choices[0]?.value ?? '')
  ));
  const current = controlled ? String(value ?? '') : internal;

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const fid = id || nextId();

  const selected = choices.find((c) => c.value === current);

  const close = () => setOpen(false);

  const place = () => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 6;
    const margin = 12;
    const spaceBelow = vh - b.bottom - margin;
    const spaceAbove = b.top - margin;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(360, (openUp ? spaceAbove : spaceBelow) - gap));
    setCoords({
      left: Math.max(margin, Math.min(b.left, vw - b.width - margin)),
      width: b.width,
      top: openUp ? undefined : b.bottom + gap,
      bottom: openUp ? vh - b.top + gap : undefined,
      maxHeight,
    });
  };

  useLayoutEffect(() => { if (open) place(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (btnRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    // Rolar a página ou um container só reposiciona (nunca fecha). Rolar dentro do
    // próprio menu é ignorado para não causar reflow.
    let raf = 0;
    const reposition = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; place(); });
    };
    const onScroll = (e) => {
      if (listRef.current && listRef.current.contains(e.target)) return;
      reposition();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const pick = (v) => {
    close();
    if (v === current) return;
    if (!controlled) setInternal(v);
    onChange?.({ target: { value: v } });
  };

  const trigger = (
    <button
      ref={btnRef}
      type="button"
      id={fid}
      className={`select-control ${className}`.trim()}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      data-placeholder={selected ? undefined : 'true'}
      onClick={() => !disabled && setOpen((o) => !o)}
      {...rest}
    >
      <span className="select-value">{selected ? selected.label : placeholder}</span>
      <Icon name="chevron-down" size={14} />
    </button>
  );

  const menu = open && coords ? createPortal(
    <div
      ref={listRef}
      className="select-menu"
      role="listbox"
      style={{ left: coords.left, width: coords.width, top: coords.top, bottom: coords.bottom, maxHeight: coords.maxHeight }}
    >
      {choices.map((c) => (
        <button
          key={c.value}
          type="button"
          role="option"
          aria-selected={c.value === current}
          className={c.value === current ? 'active' : ''}
          onClick={() => pick(c.value)}
        >
          <span className="select-opt-label">{c.label}</span>
          {c.value === current ? <Icon name="check" size={14} /> : null}
        </button>
      ))}
    </div>,
    document.body,
  ) : null;

  if (!label) {
    return (
      <span className="select-wrap">
        {trigger}
        {menu}
        {(error || success || hint) ? <span className="help">{error || success || hint}</span> : null}
      </span>
    );
  }

  return (
    <Field label={label} hint={hint} error={error} success={success} id={fid}>
      {() => <>{trigger}{menu}</>}
    </Field>
  );
}

export function Textarea({ label, hint, error, success, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} success={success}>
      {(id) => <textarea id={id} {...rest} />}
    </Field>
  );
}

export function Checkbox({ label, ...rest }) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" {...rest} /> {label}
    </label>
  );
}

export function Radio({ label, ...rest }) {
  return (
    <label className="radio-row">
      <input type="radio" {...rest} /> {label}
    </label>
  );
}

export function FieldRow({ children }) {
  return <div className="field-grid">{children}</div>;
}
