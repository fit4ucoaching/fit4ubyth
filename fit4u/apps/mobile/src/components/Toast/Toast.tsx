import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUiStore, type Toast as ToastModel } from "../../store/uiStore";

const ICONS = { success: CheckCircle2, error: XCircle, warning: TriangleAlert, info: Info } as const;
const COLORS = { success: "#2ECC71", error: "#E74C3C", warning: "#F1C40F", info: "#3B9EFF" } as const;
const AUTO_DISMISS_MS = 3500;

function ToastItem({ toast }: { toast: ToastModel }): JSX.Element {
  const dismissToast = useUiStore((s) => s.dismissToast);
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismissToast]);

  return (
    <Animated.View entering={SlideInUp} exiting={SlideOutUp} className="mb-sm">
      <Pressable
        onPress={() => dismissToast(toast.id)}
        className="flex-row items-center gap-sm rounded-lg bg-surfaceElevated px-lg py-md shadow-lg"
        accessibilityRole="alert"
      >
        <Icon size={20} color={COLORS[toast.variant]} />
        <Text className="flex-1 text-textPrimary text-sm">{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Hôte de toasts global — monté une seule fois à la racine de l'app (voir `app/AppProviders.tsx`). */
export function ToastHost(): JSX.Element {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <SafeAreaView pointerEvents="box-none" className="absolute inset-x-0 top-0 z-toast px-lg pt-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </SafeAreaView>
  );
}
