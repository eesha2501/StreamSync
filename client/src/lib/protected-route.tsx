import { ReactNode } from 'react';
import { Route, Redirect, RouteComponentProps } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@shared/schema';

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({ 
  path, 
  component: Component, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  const ProtectedComponent = (props: any) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#141414]">
          <Loader2 className="h-8 w-8 animate-spin text-[#E50914]" />
        </div>
      );
    }
  
    // If not logged in, redirect to login
    if (!user) {
      return <Redirect to="/auth" />;
    }
  
    // If roles are specified, check if user has permission
    if (allowedRoles && allowedRoles.length > 0) {
      const hasPermission = allowedRoles.includes(user.role as UserRole);
      
      if (!hasPermission) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] text-white p-4">
            <h1 className="text-2xl font-bold text-[#E50914] mb-4">Access Denied</h1>
            <p className="text-center max-w-md mb-6">
              You don't have permission to access this page. This area is restricted to {allowedRoles.join(' or ')} users.
            </p>
            <Redirect to="/" />
          </div>
        );
      }
    }
  
    // If everything is fine, render the requested component
    return <Component {...props} />;
  };

  return <Route path={path} component={ProtectedComponent} />;
}

export function AdminRoute({ path, component }: { path: string, component: React.ComponentType<any> }) {
  return <ProtectedRoute path={path} component={component} allowedRoles={[UserRole.ADMIN]} />;
}

export function ChannelAdminRoute({ path, component }: { path: string, component: React.ComponentType<any> }) {
  return <ProtectedRoute path={path} component={component} allowedRoles={[UserRole.ADMIN, UserRole.CHANNEL_ADMIN]} />;
}