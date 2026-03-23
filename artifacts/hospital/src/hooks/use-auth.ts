import { useState, useEffect } from "react";
import { useAuthLogin, useAuthRegister, useGetProfile } from "@workspace/api-client-react";
import type { User, LoginRequest, RegisterRequest } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  
  // Use the generated getProfile hook, only enabled if we have a token
  const { data: user, isLoading, error } = useGetProfile({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useAuthLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        queryClient.setQueryData(["/api/auth/profile"], data.user);
      }
    }
  });

  const registerMutation = useAuthRegister({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        queryClient.setQueryData(["/api/auth/profile"], data.user);
      }
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.setQueryData(["/api/auth/profile"], null);
    window.location.href = "/login";
  };

  // If profile fetch fails (e.g. token expired), clear token
  useEffect(() => {
    if (error) {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, [error]);

  return {
    user: user as User | undefined,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
