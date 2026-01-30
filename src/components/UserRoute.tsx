import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Protects user-only routes: redirects admins to /admin */
const UserRoute = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  return isAdmin ? <Navigate to="/admin" replace /> : <Outlet />;
};

export default UserRoute;
