import { WifiOff } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUiStore } from "../store/uiStore";

/** Bandeau offline global (Volume 4) — informe sans bloquer : les données locales restent consultables. */
export function OfflineBanner(): JSX.Element | null {
  const isOffline = useUiStore((s) => s.isOffline);
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View className="absolute inset-x-0 z-toast flex-row items-center justify-center gap-xs bg-warning py-xs" style={{ top: insets.top }}>
      <WifiOff size={14} color="#0A0A0A" />
      <Text className="text-xs font-semibold text-background">Mode hors ligne — synchronisation au retour du réseau</Text>
    </View>
  );
}
