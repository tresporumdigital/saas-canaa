import { Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/templates/AuthLayout.jsx';
import LoginForm from '../../components/organisms/auth/LoginForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Página pública. Só login com e-mail e senha — sem cadastro e sem login social.
export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
