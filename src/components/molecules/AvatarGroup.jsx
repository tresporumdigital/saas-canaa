import Avatar from '../atoms/Avatar.jsx';

// Molécula: pilha de avatares com "+N" de excedente.
export function AvatarGroup({ names = [], size = 'sm', max = 4 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="avatar-group">
      {shown.map((n, i) => <Avatar key={i} name={n} size={size} />)}
      {extra > 0 ? <span className={`avatar ${size}`}>+{extra}</span> : null}
    </span>
  );
}

export default AvatarGroup;
