import { useNavigate } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';

// Molécula: KPI (rótulo + valor + ícone + rodapé/tendência). `to` torna o card clicável.
export function StatCard({ label, value, icon, tone = 'accent', foot, trend, to }) {
  const navigate = useNavigate();
  const Comp = to ? 'button' : 'div';
  return (
    <Comp className="stat-card" onClick={to ? () => navigate(to) : undefined}>
      <div className="sc-head">
        <span className="sc-label">{label}</span>
        {icon ? <span className={`sc-ic ${tone === 'accent' ? '' : tone}`}><Icon name={icon} size={15} /></span> : null}
      </div>
      <div className="sc-value">{value}</div>
      {(foot || trend) && (
        <div className="sc-foot">
          {trend ? <span className={trend.dir === 'down' ? 'down' : 'up'}>{trend.dir === 'down' ? '▾' : '▴'} {trend.label}</span> : null}
          {trend && foot ? ' · ' : null}
          {foot}
        </div>
      )}
    </Comp>
  );
}

export default StatCard;
