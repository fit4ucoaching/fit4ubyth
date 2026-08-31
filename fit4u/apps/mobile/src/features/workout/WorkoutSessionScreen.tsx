import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import type { WorkoutStackParamList } from "../../navigation/WorkoutNavigator";
import { useFinishWorkout } from "../../services/useWorkouts";
import { useWorkoutStore } from "../../store/workoutStore";
import { ExercisePlayerScreen } from "./ExercisePlayerScreen";
import { RestScreen } from "./RestScreen";

type Props = NativeStackScreenProps<WorkoutStackParamList, "WorkoutSession">;

/**
 * Orchestrateur de séance (Volume 4) — bascule entre les phases
 * "Exercice"/"Repos" selon `workoutStore.phase`, incrémente le chronomètre
 * global. La navigation "Remplacement d'exercice" ouvre un Sheet plutôt
 * qu'un nouvel écran, pour ne jamais perdre le contexte de la séance en cours.
 */
export function WorkoutSessionScreen({ navigation }: Props): JSX.Element {
  const { phase, workoutSessionId, exercises, currentExerciseIndex, tickElapsed } = useWorkoutStore();
  const finishWorkout = useFinishWorkout();

  useEffect(() => {
    const interval = setInterval(tickElapsed, 1000);
    return () => clearInterval(interval);
  }, [tickElapsed]);

  useEffect(() => {
    const isLastExerciseDone =
      currentExerciseIndex === exercises.length - 1 && exercises[currentExerciseIndex]?.isCompleted;

    if (isLastExerciseDone && workoutSessionId) {
      finishWorkout.mutate(
        {
          workoutSessionId,
          exercises: exercises.map((e) => ({
            exerciseId: e.exercise.id,
            setsCompleted: e.setsCompleted,
            repsCompleted: e.repsCompleted,
            weightUsedKg: e.weightUsedKg,
          })),
        },
        {
          onSuccess: (result) =>
            navigation.replace("WorkoutSummary", {
              durationSeconds: result.durationSeconds ?? 0,
              caloriesBurned: result.caloriesBurned ?? 0,
              exerciseCount: result.exercises.length,
            }),
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseIndex, exercises]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {phase === "resting" ? (
        <RestScreen />
      ) : (
        <ExercisePlayerScreen onReplaceExercise={() => navigation.navigate("ReplaceExercise")} />
      )}
    </SafeAreaView>
  );
}
