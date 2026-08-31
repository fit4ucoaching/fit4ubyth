import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

function Dot({ delay }: { delay: number }): JSX.Element {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1),
    );
  }, [opacity, delay]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-textSecondary" />;
}

/** Indicateur "Teddy est en train d'écrire…" — trois points animés en cascade. */
export function TeddyTypingIndicator(): JSX.Element {
  return (
    <View className="flex-row gap-xxs self-start rounded-lg bg-surfaceElevated px-md py-sm">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
