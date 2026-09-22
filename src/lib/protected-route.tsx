import { useAuth } from "@/hooks/use-auth";
import { homeForRole } from "@/lib/auth-routing";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import type { Role } from "@shared/schema";

type ProtectedRouteProps = {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: Role;
  allowedRoles?: Role[];
};

/**
 * Role gate: signed-out users go to the login page, signed-in users with the
 * wrong role are sent to their own dashboard.
 */
export function ProtectedRoute({ path, component: Component, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const roles = allowedRoles ?? (requiredRole ? [requiredRole] : undefined);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    const requestedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return (
      <Route path={path}>
        <Redirect to={`/auth?next=${encodeURIComponent(requestedPath)}`} replace />
      </Route>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Route path={path}>
        <Redirect to={homeForRole(user.role)} replace />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
