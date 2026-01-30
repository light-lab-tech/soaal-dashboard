import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Protects /admin routes: only admin and super_admin can access. */
const AdminRoute = () => {
  const { user } = useAuth();
  const canAccess = user?.role === 'admin' || user?.role === 'super_admin';
  return canAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
