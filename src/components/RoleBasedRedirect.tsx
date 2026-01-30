import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Redirects / and /dashboard based on role: admins go to /admin, users go to /dashboard */
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'super_admin' || user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

export default RoleBasedRedirect;
