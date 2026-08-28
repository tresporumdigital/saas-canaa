// Átomo: barra de progresso simples (0–100).
export function Bar({ value = 0 }) {
  return <div className="bar"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export default Bar;
