import { useAuth } from "@/hooks/use-auth";
import { homeForRole } from "@/lib/auth-routing";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: () => React.JSX.Element;
  requiredRole: "admin" | "partner";
};

/**
 * Role gate: signed-out users go to the login page, signed-in users with the
 * wrong role are sent to their own dashboard.
 */
export function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

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
    return (
      <Route path={path}>
        <Redirect to="/auth" replace />
      </Route>
    );
  }

  if (user.role !== requiredRole) {
    return (
      <Route path={path}>
        <Redirect to={homeForRole(user.role)} replace />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
