import IconSprite from '../atoms/IconSprite.jsx';
import Icon from '../atoms/Icon.jsx';
import logoCanaa from '../../assets/logo-canaa.png';

// Template: cena de autenticação — coluna de marca + painel do formulário sobre o gradiente.
export default function AuthLayout({ children }) {
  return (
    <>
      <IconSprite />
      <div className="auth-scene">
        <aside className="auth-aside">
          <div className="auth-brand">
            <img className="auth-logo" src={logoCanaa} alt="Funerária Canaã" />
          </div>
          <div className="auth-aside-body">
            <h1>Gestão funerária, do plano ao pós-atendimento.</h1>
            <p>
              Planos e contratos, registro de óbito, guias de atendimento, equipamentos e
              financeiro em um registro único e rastreável.
            </p>
            <ul className="auth-points">
              <li><Icon name="shield" size={16} /> Controle de acesso por perfil</li>
              <li><Icon name="database" size={16} /> Backups automáticos e trilha de auditoria</li>
              <li><Icon name="trend" size={16} /> Indicadores de receita e inadimplência</li>
            </ul>
          </div>
          <p className="auth-aside-foot">Funerária Canaã · Sistema de gestão</p>
        </aside>
        <main className="auth-panel">{children}</main>
      </div>
    </>
  );
}
