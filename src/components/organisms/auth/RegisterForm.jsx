import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../atoms/Button.jsx';
import Divider from '../../atoms/Divider.jsx';
import { Input, PasswordInput } from '../../molecules/Field.jsx';
import GoogleButton from '../../molecules/GoogleButton.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';

// Organismo: formulário de cadastro (nome + e-mail + senha, ou Google com dados automáticos).
export default function RegisterForm({ onSwitch }) {
  const { register, registerWithGoogle, googleAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(null); // 'password' | 'google' | null

  const criar = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading('password');
    setTimeout(() => {
      const u = register({
        name: nome || 'Novo Usuário',
        email: email || 'novo.usuario@funerariacanaa.com',
        password: senha,
      });
      toast(`Conta criada. Bem-vindo(a), ${u.name.split(' ')[0]}.`);
      navigate('/', { replace: true });
    }, 480);
  };

  const comGoogle = () => {
    if (loading) return;
    setLoading('google');
    setTimeout(() => {
      const u = registerWithGoogle();
      toast(`Cadastro concluído com a conta Google de ${u.name.split(' ')[0]}.`);
      navigate('/', { replace: true });
    }, 640);
  };

  return (
    <div className="auth-card">
      <header className="auth-card-head">
        <h2>Criar uma conta</h2>
        <p>Cadastre-se para acessar a gestão da Canaã.</p>
      </header>

      <form className="auth-form" onSubmit={criar} noValidate>
        <Input
          label="Nome completo"
          icon="user"
          autoComplete="name"
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          label="E-mail"
          type="email"
          icon="mail"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Senha"
          autoComplete="new-password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Button type="submit" variant="primary" block loading={loading === 'password'} iconRight="arrow-right">
          Criar conta
        </Button>
      </form>

      <Divider label="ou" />

      <GoogleButton loading={loading === 'google'} onClick={comGoogle}>
        Cadastrar com o Google
      </GoogleButton>
      <p className="auth-hint">
        Com o Google, nome e e-mail são preenchidos pela sua conta ({googleAccount.email}).
      </p>

      <p className="auth-switch">
        Já tem uma conta?{' '}
        <button type="button" className="link-btn" onClick={onSwitch}>Entrar</button>
      </p>
    </div>
  );
}
