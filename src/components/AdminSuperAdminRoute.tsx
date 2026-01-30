import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Protects super_admin-only routes (e.g. /admin/tenants, /admin/plans). */
const AdminSuperAdminRoute = () => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default AdminSuperAdminRoute;
