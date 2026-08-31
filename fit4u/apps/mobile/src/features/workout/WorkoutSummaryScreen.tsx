import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PartyPopper } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { StatCard } from "../../components/StatCard/StatCard";
import { Flame, Clock, Dumbbell } from "lucide-react-native";
import type { WorkoutStackParamList } from "../../navigation/WorkoutNavigator";

type Props = NativeStackScreenProps<WorkoutStackParamList, "WorkoutSummary">;

/** Résumé de fin de séance (Volume 4) — la séance a déjà été persistée par `useFinishWorkout`. */
export function WorkoutSummaryScreen({ navigation, route }: Props): JSX.Element {
  const { durationSeconds, caloriesBurned, exerciseCount } = route.params;
  const minutes = Math.round(durationSeconds / 60);

  return (
    <SafeAreaView className="flex-1 bg-background px-lg py-xl gap-xl">
      <View className="items-center gap-sm">
        <PartyPopper size={40} color="#FF6B00" />
        <Text className="text-textPrimary text-2xl font-bold text-center">Séance terminée !</Text>
        <Text className="text-textSecondary text-sm text-center">Bravo, Teddy est fier de toi 🎉</Text>
      </View>

      <View className="flex-row gap-sm">
        <StatCard icon={Clock} label="Durée" value={`${minutes} min`} />
        <StatCard icon={Flame} label="Calories" value={String(Math.round(caloriesBurned))} />
        <StatCard icon={Dumbbell} label="Exercices" value={String(exerciseCount)} />
      </View>

      <Button label="Retour au tableau de bord" size="lg" onPress={() => navigation.getParent()?.navigate("Dashboard" as never)} />
    </SafeAreaView>
  );
}
