import { X } from "lucide-react-native";
import { Modal as RNModal, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Dialogue centré (Volume 4 : "Modal / Dialog") — confirmation, formulaires courts. */
export function Modal({ visible, onClose, title, children }: ModalProps): JSX.Element {
  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 items-center justify-center bg-overlay px-lg">
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Fermer" />
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          className="w-full max-w-md rounded-lg bg-surfaceElevated p-lg"
        >
          {title ? (
            <View className="mb-md flex-row items-center justify-between">
              <Text className="text-textPrimary text-lg font-semibold">{title}</Text>
              <Pressable onPress={onClose} accessibilityLabel="Fermer" accessibilityRole="button">
                <X size={20} color="#B3B3B3" />
              </Pressable>
            </View>
          ) : null}
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
