import { Modal as RNModal, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Bottom sheet (Volume 4 : "Sheet / Drawer") — remplacement d'exercice,
 * options rapides, filtres. Le `Drawer` de navigation latérale (BackOffice
 * web, "Navigation secondaire" mobile) est géré par React Navigation
 * directement plutôt que réimplémenté ici.
 */
export function Sheet({ visible, onClose, children }: SheetProps): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-end bg-overlay">
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Fermer" />
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          className="rounded-t-xl bg-surfaceElevated px-lg pt-md"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-md h-1 w-10 self-center rounded-full bg-border" />
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
