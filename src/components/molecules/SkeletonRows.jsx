import Skeleton from '../atoms/Skeleton.jsx';

// Molécula: várias linhas de skeleton (lista/tabela carregando).
export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="stack gap-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="row" style={{ alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) 0' }}>
          <Skeleton width={38} height={38} radius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width={`${50 + (i % 3) * 12}%`} height={12} style={{ marginBottom: 8 }} />
            <Skeleton width={`${30 + (i % 2) * 10}%`} height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonRows;
