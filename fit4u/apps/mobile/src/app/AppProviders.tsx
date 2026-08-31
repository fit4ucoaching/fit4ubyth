import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "../services/queryClient";
import { useNetworkStatus } from "./useNetworkStatus";
import { ThemeProvider } from "../theme";
import { ToastHost } from "../components/Toast/Toast";
import "../i18n";

/**
 * Composition de tous les providers globaux (Volume 4) — un seul point
 * d'assemblage, jamais dispersé. Ordre : GestureHandler (doit englober tout
 * pour Reanimated) → SafeArea → QueryClient → Theme → contenu + hôtes
 * globaux (Toast).
 */
export function AppProviders({ children }: { children: React.ReactNode }): JSX.Element {
  useNetworkStatus();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
            <ToastHost />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
