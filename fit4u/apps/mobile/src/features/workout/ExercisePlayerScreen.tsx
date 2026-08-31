import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useWorkoutStore } from "../../store/workoutStore";
import { useTeddyStore } from "../../store/teddyStore";
import { WorkoutTimer } from "./WorkoutTimer";

const DEFAULT_REST_SECONDS = 60;

/**
 * Phase "Exercice" (Volume 4) — séries/répétitions/charge saisies, animation
 * Teddy (bulle contextuelle plutôt que vidéo lourde en plein exercice, pour
 * ne jamais distraire du chronomètre), repos automatique déclenché à la fin
 * de chaque série. Le "remplacement d'exercice" ouvre la recherche
 * d'exercices filtrée sur le même groupe musculaire (voir `ExercisesStack`).
 */
export function ExercisePlayerScreen({ onReplaceExercise }: { onReplaceExercise: () => void }): JSX.Element {
  const { exercises, currentExerciseIndex, elapsedSeconds, completeCurrentExercise, startRest } = useWorkoutStore();
  const toggleTeddyBubble = useTeddyStore((s) => s.toggleBubble);
  const current = exercises[currentExerciseIndex];

  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  if (!current) return <View className="flex-1 bg-background" />;

  const handleCompleteSet = (): void => {
    completeCurrentExercise({
      setsCompleted: current.setsCompleted + 1,
      repsCompleted: Number(reps) || current.repsCompleted,
      weightUsedKg: Number(weight) || current.weightUsedKg,
    });
    startRest(DEFAULT_REST_SECONDS);
  };

  return (
    <View className="flex-1 bg-background px-lg py-lg gap-xl">
      <WorkoutTimer seconds={elapsedSeconds} label="Durée de la séance" />

      <View className="items-center gap-xs">
        <Text className="text-textPrimary text-xl font-bold">{current.exercise.name}</Text>
        <Text className="text-textSecondary text-sm">
          Série {current.setsCompleted + 1} — {current.exercise.difficultyLevel}
        </Text>
      </View>

      <View className="flex-row gap-md">
        <View className="flex-1">
          <Input label="Répétitions" keyboardType="numeric" value={reps} onChangeText={setReps} />
        </View>
        <View className="flex-1">
          <Input label="Charge (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} />
        </View>
      </View>

      <Button label="Valider la série" size="lg" fullWidth onPress={handleCompleteSet} />

      <View className="flex-row justify-between">
        <Button label="Remplacer l'exercice" variant="ghost" size="sm" onPress={onReplaceExercise} />
        <Button
          label="Demander à Teddy"
          variant="ghost"
          size="sm"
          leftIcon={<Sparkles size={14} color="#FF6B00" />}
          onPress={() => toggleTeddyBubble(true)}
        />
      </View>
    </View>
  );
}
