import * as Network from "expo-network";
import { useEffect } from "react";

import { useUiStore } from "../store/uiStore";

/**
 * Surveille la connectivité réseau (Volume 4 : "OFFLINE — synchronisation
 * automatique au retour du réseau") et met à jour `uiStore.isOffline`, lu
 * par le bandeau offline global et par React Query (`refetchOnReconnect`
 * est déjà activé par défaut — ce hook ne fait qu'exposer l'état pour l'UI).
 */
export function useNetworkStatus(): void {
  const setOffline = useUiStore((s) => s.setOffline);

  useEffect(() => {
    const subscription = Network.addNetworkStateListener((state) => {
      setOffline(state.isConnected === false);
    });
    return () => subscription.remove();
  }, [setOffline]);
}
