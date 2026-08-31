import { Loader2 } from "lucide-react-native";
import { Pressable, Text, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primaryMuted",
  secondary: "bg-surfaceElevated active:bg-surface",
  outline: "bg-transparent border border-border active:bg-surface",
  ghost: "bg-transparent active:bg-surface",
  danger: "bg-danger active:opacity-80",
};

const TEXT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-textPrimary",
  outline: "text-textPrimary",
  ghost: "text-primary",
  danger: "text-white",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-md py-xs rounded-md",
  md: "px-lg py-sm rounded-lg",
  lg: "px-xl py-md rounded-lg",
};

const TEXT_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * Composant Button du design system — variantes/tailles couvrent tous les
 * usages de l'app (CTA principal, actions secondaires, destructives).
 * Animation d'appui légère (scale) via Reanimated pour une sensation
 * premium fluide (Volume 4 : "60 FPS").
 */
export function Button({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps): JSX.Element {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle} className={fullWidth ? "w-full" : undefined}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || isLoading }}
        disabled={disabled || isLoading}
        onPressIn={(e) => {
          scale.value = withTiming(0.97, { duration: 100 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withTiming(1, { duration: 150 });
          onPressOut?.(e);
        }}
        className={`flex-row items-center justify-center gap-sm ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${
          disabled || isLoading ? "opacity-50" : ""
        } ${fullWidth ? "w-full" : ""}`}
        {...pressableProps}
      >
        {isLoading ? (
          <Loader2 size={18} color="#FFFFFF" />
        ) : (
          <>
            {leftIcon}
            <Text className={`font-semibold ${TEXT_VARIANT_CLASSES[variant]} ${TEXT_SIZE_CLASSES[size]}`}>
              {label}
            </Text>
            {rightIcon}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
