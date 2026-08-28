// Átomo: indicador de carregamento (círculo girando). Herda a cor via currentColor.
export default function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`spinner ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Carregando"
    />
  );
}
