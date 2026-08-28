import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Organismo/guarda de rota: sem sessão -> redireciona para /login, guardando o destino.
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from: from === '/' ? undefined : from }} />;
  }

  return children;
}
