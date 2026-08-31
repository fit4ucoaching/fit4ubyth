import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

export interface ProgressProps {
  /** 0 à 100 */
  value: number;
  variant?: "primary" | "success" | "warning" | "danger";
  height?: number;
}

const VARIANT_CLASSES = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

/** Barre de progression linéaire animée — utilisée pour XP, objectifs, hydratation. */
export function Progress({ value, variant = "primary", height = 8 }: ProgressProps): JSX.Element {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(value, 0), 100), { duration: 400 });
  }, [value, width]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View className="w-full overflow-hidden rounded-full bg-surfaceElevated" style={{ height }}>
      <Animated.View className={`h-full rounded-full ${VARIANT_CLASSES[variant]}`} style={animatedStyle} />
    </View>
  );
}
