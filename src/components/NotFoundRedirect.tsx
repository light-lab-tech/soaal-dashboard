import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** For path "*": redirect to /dashboard if authenticated, /login otherwise. */
const NotFoundRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

export default NotFoundRedirect;
