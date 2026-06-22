import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const hasRole = allowedRoles.some(role => {
      const normalizedRole = role.startsWith('ROLE_') ? role.slice(5) : role;
      return user.roles.some(uRole => {
        const normalizedURole = uRole.startsWith('ROLE_') ? uRole.slice(5) : uRole;
        return normalizedRole === normalizedURole;
      });
    });
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
