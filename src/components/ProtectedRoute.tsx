import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProfile, UserRole } from '@/hooks/use-profile';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { role, loading, profile } = useProfile();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-xs sm:text-sm text-muted-foreground">Verifying authorization...</p>
      </div>
    );
  }

  // Not logged in
  if (!profile) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

