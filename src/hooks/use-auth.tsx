import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useMutation, useQuery, type UseMutationResult } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/api/queryKeys";
import { authUserQueryOptions } from "@/auth/auth.queries";
import { loginAndRestore, logoutAndClear, registerAndRestore } from "@/auth/auth.mutations";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/auth/auth.types";
import { onUnauthorized } from "@/api/sessionEvents";
import { clearProtectedQueryData } from "@/auth/auth.mutations";
import { queryClient as partnerQueryClient } from "@/partner/queryClient";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthUser, Error, LoginRequest>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthUser, Error, RegisterRequest>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { data: user, error, isLoading } = useQuery(authUserQueryOptions);

  useEffect(() => onUnauthorized(() => {
    clearProtectedQueryData(queryClient);
    clearProtectedQueryData(partnerQueryClient);
    queryClient.setQueryData(queryKeys.auth.user, null);
  }), []);

  const loginMutation = useMutation<AuthUser, Error, LoginRequest>({
    mutationFn: loginAndRestore,
    onSuccess: (authenticatedUser) => {
      queryClient.setQueryData(queryKeys.auth.user, authenticatedUser);
      toast({
        title: "Login erfolgreich",
        description: `Willkommen zurück, ${authenticatedUser.fullName}!`,
      });
    },
    onError: (mutationError) => {
      toast({ title: "Login fehlgeschlagen", description: mutationError.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation<AuthUser, Error, RegisterRequest>({
    mutationFn: registerAndRestore,
    onSuccess: (authenticatedUser) => {
      queryClient.setQueryData(queryKeys.auth.user, authenticatedUser);
      toast({
        title: "Registrierung erfolgreich",
        description: `Willkommen bei FreizeitEngel, ${authenticatedUser.fullName}!`,
      });
    },
    onError: (mutationError) => {
      toast({ title: "Registrierung fehlgeschlagen", description: mutationError.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: () => logoutAndClear(queryClient, [partnerQueryClient]),
    onSuccess: () => {
      toast({ title: "Abmeldung erfolgreich", description: "Du wurdest erfolgreich abgemeldet." });
    },
    onError: (mutationError) => {
      toast({ title: "Abmeldung fehlgeschlagen", description: mutationError.message, variant: "destructive" });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error ?? null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
