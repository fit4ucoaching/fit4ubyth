import { useNavigation } from "@react-navigation/native";
import { Sparkles, X } from "lucide-react-native";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTeddyStore } from "../../store/teddyStore";

/**
 * Bulle Teddy flottante — présente sur Dashboard/séances/nutrition/rapports
 * (Volume 4, exigence explicite de présence transverse). Montée UNE SEULE
 * FOIS au niveau de `MainNavigator` (jamais par écran) pour ne jamais se
 * démonter/remonter pendant la navigation, garantissant une position et un
 * état visuellement stables.
 */
export function TeddyBubble(): JSX.Element {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isBubbleExpanded, toggleBubble } = useTeddyStore();

  const handlePress = (): void => {
    toggleBubble(false);
    navigation.navigate("Teddy" as never);
  };

  if (!isBubbleExpanded) return <></>;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute right-lg z-toast"
      style={{ bottom: insets.bottom + 72 }}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir Teddy"
        className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Sparkles size={24} color="#FFFFFF" />
      </Pressable>
      <Pressable
        onPress={() => toggleBubble(false)}
        accessibilityLabel="Masquer Teddy"
        className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-surfaceElevated"
      >
        <X size={12} color="#B3B3B3" />
      </Pressable>
    </Animated.View>
  );
}
