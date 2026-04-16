import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';

const normalizeRoles = (allowedRoles) => {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.filter(Boolean);
  }

  return allowedRoles ? [allowedRoles] : [];
};

const AccessGate = ({
  children,
  allowGuests = false,
  allowedRoles = [],
  redirectTo = '/login',
  fallbackPath,
}) => {
  const { isAuthenticated, user, hasRole, getDefaultRoute } = useAuth();
  const location = useLocation();
  const roleList = normalizeRoles(allowedRoles);
  const resolvedFallback = fallbackPath || getDefaultRoute(user);

  if (allowGuests) {
    if (isAuthenticated) {
      return <Navigate to={resolvedFallback} replace />;
    }

    return children ?? <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (roleList.length > 0 && !hasRole(roleList)) {
    return (
      <Navigate
        to={resolvedFallback}
        replace
        state={{ deniedFrom: location.pathname }}
      />
    );
  }

  return children ?? <Outlet />;
};

export default AccessGate;
