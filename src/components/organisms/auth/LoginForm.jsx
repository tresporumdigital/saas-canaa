import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../atoms/Button.jsx';
import Divider from '../../atoms/Divider.jsx';
import { Input, PasswordInput } from '../../molecules/Field.jsx';
import GoogleButton from '../../molecules/GoogleButton.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';

// Organismo: formulário de acesso (e-mail + senha, ou Google). Mock: qualquer dado entra.
export default function LoginForm({ onSwitch }) {
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(null); // 'password' | 'google' | null

  const finish = (user, msg) => {
    toast(msg);
    navigate(dest, { replace: true });
  };

  const entrar = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading('password');
    // Simula a latência do backend que ainda será construído.
    setTimeout(() => {
      const u = login({ email: email || 'atendente@funerariacanaa.com', password: senha });
      finish(u, `Bem-vindo(a), ${u.name.split(' ')[0]}.`);
    }, 420);
  };

  const comGoogle = () => {
    if (loading) return;
    setLoading('google');
    setTimeout(() => {
      const u = loginWithGoogle();
      finish(u, `Conectado como ${u.email}.`);
    }, 620);
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
        <Button type="submit" variant="primary" block loading={loading === 'password'} iconRight="arrow-right">
          Entrar
        </Button>
      </form>

      <Divider label="ou" />

      <GoogleButton loading={loading === 'google'} onClick={comGoogle}>
        Entrar com o Google
      </GoogleButton>

      <p className="auth-switch">
        Não tem uma conta?{' '}
        <button type="button" className="link-btn" onClick={onSwitch}>Cadastre-se</button>
      </p>
    </div>
  );
}
