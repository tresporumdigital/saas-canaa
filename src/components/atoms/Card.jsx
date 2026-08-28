// Átomo de superfície: cartão branco arredondado. `title`/`action` desenham o cabeçalho.
export function Card({ title, action, children, className = '', pad = 'md', ...rest }) {
  return (
    <section className={`card ${pad === 'lg' ? 'pad-lg' : ''} ${className}`.trim()} {...rest}>
      {title ? (
        <div className="card-title">
          <span>{title}</span>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default Card;
