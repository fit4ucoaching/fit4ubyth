import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useExercises } from "../../services/useExercises";
import { useWorkoutStore } from "../../store/workoutStore";
import type { WorkoutStackParamList } from "../../navigation/WorkoutNavigator";

type Props = NativeStackScreenProps<WorkoutStackParamList, "ReplaceExercise">;

/** Remplacement d'exercice en cours de séance (Volume 4) — filtré sur le même groupe musculaire. */
export function ReplaceExerciseScreen({ navigation }: Props): JSX.Element {
  const { exercises, currentExerciseIndex, replaceCurrentExercise } = useWorkoutStore();
  const current = exercises[currentExerciseIndex];
  const { data } = useExercises({ muscleGroupId: current?.exercise.primaryMuscleId });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-lg pt-sm pb-md">
        <Text className="text-textPrimary text-xl font-bold">Remplacer l'exercice</Text>
        <Text className="text-textSecondary text-sm">Même groupe musculaire que {current?.exercise.name}</Text>
      </View>
      <FlatList
        data={data?.pages.flatMap((p) => p.items) ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-lg gap-sm pb-xxl"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              replaceCurrentExercise({ ...current!, exercise: item, setsCompleted: 0, isCompleted: false });
              navigation.goBack();
            }}
            className="rounded-lg border border-border bg-surface p-md"
          >
            <Text className="text-textPrimary font-medium">{item.name}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
