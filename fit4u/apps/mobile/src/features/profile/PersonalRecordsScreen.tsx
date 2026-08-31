import { Trophy } from "lucide-react-native";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePersonalRecords } from "../../services/useWorkouts";

export function PersonalRecordsScreen(): JSX.Element {
  const { data: records } = usePersonalRecords();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={records ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-sm p-lg pb-xxl"
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-sm rounded-lg bg-surface p-md">
            <Trophy size={20} color="#FF6B00" />
            <View className="flex-1">
              <Text className="text-textPrimary font-medium">{item.exercise.name}</Text>
              <Text className="text-textSecondary text-xs">
                {item.weightKg ? `${item.weightKg} kg` : ""} {item.reps ? `× ${item.reps}` : ""}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
