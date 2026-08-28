import { useState } from 'react';
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

export function Select({ label, hint, error, success, options = [], children, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} success={success}>
      {(id) => (
        <select id={id} {...rest}>
          {children || options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      )}
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
