// Átomo: mini-colunas (sparkline sem libs). data: array de números.
export function Spark({ data = [] }) {
  const max = Math.max(1, ...data);
  const hiIdx = data.indexOf(Math.max(...data));
  return (
    <div className="spark" aria-hidden="true">
      {data.map((v, i) => (
        <i key={i} className={i === hiIdx ? 'hi' : ''} style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}

export default Spark;
