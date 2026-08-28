// Átomo: selo semântico (success / warning / danger / info / neutral).
export function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export default Badge;
