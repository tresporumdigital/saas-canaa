import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icon from '../components/ui/Icon.jsx';

const ToastContext = createContext(null);

let seq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback((message, opts = {}) => {
    const id = ++seq;
    const kind = opts.kind || 'success';
    setToasts((list) => [...list, { id, message, kind }]);
    timers.current[id] = setTimeout(() => dismiss(id), opts.duration || 3800);
    return id;
  }, [dismiss]);

  const iconFor = (kind) => (kind === 'warning' || kind === 'danger' ? 'alert' : kind === 'info' ? 'bell' : 'check');

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <span className="ic"><Icon name={iconFor(t.kind)} /></span>
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
