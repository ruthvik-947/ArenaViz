import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type ArenaAuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  startAuth: () => void;
  logout: () => void;
  token: string | null;
};

const ArenaAuthContext = createContext<ArenaAuthContextType | null>(null);

export function ArenaAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const { data: token, isLoading } = useQuery<string | null>({
    queryKey: ["/api/arena/token"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/arena/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/arena/token"], null);
      toast({
        title: "Logged out",
        description: "Successfully logged out of Are.na",
      });
    },
  });

  const startAuth = () => {
    // Open the auth window and handle the response
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const authWindow = window.open(
      "/api/arena/auth",
      "arena-auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Add event listener for auth completion
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "ARENA_AUTH_SUCCESS") {
        queryClient.invalidateQueries({ queryKey: ["/api/arena/token"] });
        toast({
          title: "Authentication successful",
          description: "Successfully connected to Are.na",
        });
      } else if (event.data.type === "ARENA_AUTH_ERROR") {
        toast({
          title: "Authentication failed",
          description: event.data.error || "Failed to connect to Are.na",
          variant: "destructive",
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up event listener when auth window closes
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);
  };

  return (
    <ArenaAuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        startAuth,
        logout: () => logoutMutation.mutate(),
        token: token || null,
      }}
    >
      {children}
    </ArenaAuthContext.Provider>
  );
}

export function useArenaAuth() {
  const context = useContext(ArenaAuthContext);
  if (!context) {
    throw new Error("useArenaAuth must be used within ArenaAuthProvider");
  }
  return context;
}