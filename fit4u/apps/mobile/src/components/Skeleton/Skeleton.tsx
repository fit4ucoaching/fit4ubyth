import { useEffect } from "react";
import { View, type DimensionValue } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

/** Placeholder de chargement pulsé — écrans en attente de données (Volume 4 : "skeletons"). */
export function Skeleton({ width = "100%", height = 16, borderRadius = 8 }: SkeletonProps): JSX.Element {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })), -1);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width, height, borderRadius }, animatedStyle]} className="bg-surfaceElevated" />;
}

/** Composition prête à l'emploi pour une carte en chargement (ExerciseCard/ProgramCard…). */
export function SkeletonCard(): JSX.Element {
  return (
    <View className="gap-sm rounded-lg bg-surface p-md">
      <Skeleton height={120} borderRadius={10} />
      <Skeleton height={14} width="70%" />
      <Skeleton height={12} width="40%" />
    </View>
  );
}
