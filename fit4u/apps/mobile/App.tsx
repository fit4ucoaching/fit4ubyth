import { StatusBar } from "expo-status-bar";

import { AppProviders, OfflineBanner } from "./src/app";
import { RootNavigator } from "./src/navigation/RootNavigator";

/**
 * Point d'entrée de l'app mobile Fit4U. Ne contient aucune logique métier —
 * uniquement l'assemblage des providers globaux (`AppProviders`) et le
 * montage de la navigation racine, conformément à Volume 1 ("Ne contient
 * aucune logique métier").
 */
export default function App(): JSX.Element {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <OfflineBanner />
      <RootNavigator />
    </AppProviders>
  );
}
