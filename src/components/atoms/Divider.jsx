// Átomo: régua horizontal. Com `label`, vira separador "— ou —".
export function Divider({ label }) {
  if (!label) return <hr className="divider" />;
  return <div className="divider-label" role="separator" aria-label={label}><span>{label}</span></div>;
}

export default Divider;
