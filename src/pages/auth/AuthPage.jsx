import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/templates/AuthLayout.jsx';
import LoginForm from '../../components/organisms/auth/LoginForm.jsx';
import RegisterForm from '../../components/organisms/auth/RegisterForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Página pública. Alterna entre "entrar" e "cadastrar" sem trocar de rota.
// A tela inicial é sempre a de login com e-mail e senha.
export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState('login');

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  return (
    <AuthLayout>
      {mode === 'login'
        ? <LoginForm onSwitch={() => setMode('register')} />
        : <RegisterForm onSwitch={() => setMode('login')} />}
    </AuthLayout>
  );
}
