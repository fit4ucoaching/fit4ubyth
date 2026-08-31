import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import type { WorkoutStackParamList } from "../../navigation/WorkoutNavigator";
import { useProgram } from "../../services/usePrograms";
import { useStartWorkout } from "../../services/useWorkouts";

type Props = NativeStackScreenProps<WorkoutStackParamList, "ProgramDetail">;

export function ProgramDetailScreen({ route, navigation }: Props): JSX.Element {
  const { data: program } = useProgram(route.params.programId);
  const startWorkout = useStartWorkout();

  if (!program) return <SafeAreaView className="flex-1 bg-background" />;

  const firstDay = program.weeks[0]?.days.find((d) => !d.isRestDay);

  const handleStart = (): void => {
    if (!firstDay) return;
    startWorkout.mutate(
      {
        programId: program.id,
        title: `${program.name} — Jour ${firstDay.dayNumber}`,
        exerciseIds: firstDay.exercises.map((e) => e.exerciseId),
      },
      { onSuccess: () => navigation.navigate("WorkoutSession") },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-lg">
        <View className="gap-sm">
          <Text className="text-textPrimary text-2xl font-bold">{program.name}</Text>
          <View className="flex-row gap-xs">
            <Badge label={`${program.durationWeeks} semaines`} variant="neutral" />
            <Badge label={program.difficultyLevel} variant="primary" />
          </View>
          {program.description ? <Text className="text-textSecondary text-sm">{program.description}</Text> : null}
        </View>

        <View className="gap-sm">
          <Text className="text-textPrimary font-semibold">Programme</Text>
          {program.weeks.map((week) => (
            <Card key={week.id} variant="flat" padding="md" className="gap-xs">
              <Text className="text-textPrimary font-medium">Semaine {week.weekNumber}</Text>
              {week.days.map((day) => (
                <Text key={day.id} className="text-textSecondary text-sm">
                  Jour {day.dayNumber} — {day.isRestDay ? "Repos" : `${day.exercises.length} exercices`}
                </Text>
              ))}
            </Card>
          ))}
        </View>
      </ScrollView>

      <View className="px-lg pb-xl">
        <Button label="Démarrer la première séance" size="lg" fullWidth isLoading={startWorkout.isPending} onPress={handleStart} />
      </View>
    </SafeAreaView>
  );
}
