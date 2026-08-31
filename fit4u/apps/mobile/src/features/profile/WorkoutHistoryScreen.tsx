import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../components/Badge/Badge";
import { useWorkoutHistory } from "../../services/useWorkouts";

export function WorkoutHistoryScreen(): JSX.Element {
  const { data } = useWorkoutHistory();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-sm p-lg pb-xxl"
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-lg bg-surface p-md">
            <View>
              <Text className="text-textPrimary font-medium">{item.title}</Text>
              <Text className="text-textSecondary text-xs">
                {item.completedAt ? new Date(item.completedAt).toLocaleDateString("fr-FR") : ""}
              </Text>
            </View>
            <Badge label={`${Math.round((item.durationSeconds ?? 0) / 60)} min`} variant="neutral" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
