import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { AppRouter } from "./router";
import { queryClient } from "./services/queryClient";
import { hasStoredSession } from "./services/tokenStorage";
import { useCurrentUser } from "./services/useAuth";
import { useAuthStore } from "./store/authStore";
import { ThemeProvider } from "./theme";
import { ToastHost } from "./components/ToastHost";
import "./theme/global.css";
import "./i18n";

function SessionGate({ children }: { children: React.ReactNode }): JSX.Element {
  const { isHydrating, setHydrated } = useAuthStore();
  const hasSession = hasStoredSession();
  const { isFetched, isError } = useCurrentUser(hasSession);

  useEffect(() => {
    if (!hasSession || isFetched || isError) {
      setHydrated();
    }
  }, [hasSession, isFetched, isError, setHydrated]);

  if (isHydrating) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  return <>{children}</>;
}

/** Point d'entrée de l'app web. Ne contient aucune logique métier (Volume 1). */
export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionGate>
          <AppRouter />
        </SessionGate>
        <ToastHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
