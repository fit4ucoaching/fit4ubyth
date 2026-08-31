import { useEffect } from "react";
import { Text, View } from "react-native";

import { Button } from "../../components/Button/Button";
import { useWorkoutStore } from "../../store/workoutStore";
import { WorkoutTimer } from "./WorkoutTimer";

/**
 * Phase "Repos" (Volume 4) — décompte automatique géré par `workoutStore`
 * (voir `tickRest()`), affiché ici en plein écran entre deux séries.
 */
export function RestScreen(): JSX.Element {
  const { restRemainingSeconds, tickRest, goToNextExercise } = useWorkoutStore();

  useEffect(() => {
    const interval = setInterval(tickRest, 1000);
    return () => clearInterval(interval);
  }, [tickRest]);

  return (
    <View className="flex-1 items-center justify-center gap-xl bg-background px-xl">
      <Text className="text-primary text-lg font-semibold">Récupération 💪</Text>
      <WorkoutTimer seconds={restRemainingSeconds} label="Repos" />
      <Button label="Passer le repos" variant="outline" onPress={goToNextExercise} />
    </View>
  );
}
