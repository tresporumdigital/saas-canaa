import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../atoms/Button.jsx';
import { Input, PasswordInput } from '../../molecules/Field.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';

// Organismo: formulário de acesso — só e-mail + senha. Contas são criadas por um
// administrador; não há cadastro nem login social nesta tela.
export default function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const u = await login({ email, senha });
      toast(`Bem-vindo(a), ${u.name.split(' ')[0]}.`);
      navigate(dest, { replace: true });
    } catch (err) {
      toast(err.message, { kind: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-card-head">
        <h2>Entrar na conta</h2>
        <p>Acesse o painel e os módulos de gestão da Canaã.</p>
      </header>

      <form className="auth-form" onSubmit={entrar} noValidate>
        <Input
          label="E-mail"
          type="email"
          icon="mail"
          autoComplete="email"
          placeholder="voce@funerariacanaa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Senha"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Button type="submit" variant="primary" block loading={loading} iconRight="arrow-right">
          Entrar
        </Button>
      </form>

      <p className="auth-note">Não tem acesso? Fale com o administrador do sistema.</p>
    </div>
  );
}
