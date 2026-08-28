// Átomo: placeholder com shimmer enquanto o conteúdo carrega.
export function Skeleton({ width = '100%', height = 12, radius, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export default Skeleton;
