import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

import { Logo } from "../../components/Logo/Logo";
import { hasStoredSession } from "../../services/tokenStorage";
import { useAuthStore } from "../../store/authStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

/** Écran de lancement — vérifie la présence d'une session avant de router vers Welcome/Main. */
export function SplashScreen({ navigation }: Props): JSX.Element {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });

    void (async () => {
      const hasSession = await hasStoredSession();
      setHydrated();
      if (!hasSession) {
        navigation.replace("Welcome");
      }
      // Si une session existe, `RootNavigator` bascule automatiquement vers
      // MainNavigator dès que `useCurrentUser()` résout le profil (voir app/AppProviders.tsx).
    })();
  }, [navigation, setHydrated, opacity]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Animated.View style={animatedStyle}>
        <Logo size={160} />
      </Animated.View>
    </View>
  );
}
