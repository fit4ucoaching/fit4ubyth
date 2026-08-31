import { Award } from "lucide-react-native";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBadges } from "../../services/useGamification";

export function BadgesScreen(): JSX.Element {
  const { data: badges } = useBadges();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={badges ?? []}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerClassName="gap-md p-lg pb-xxl"
        columnWrapperClassName="gap-md"
        renderItem={({ item }) => (
          <View className="flex-1 items-center gap-xs rounded-lg bg-surface p-md">
            <Award size={28} color="#FF6B00" />
            <Text className="text-textPrimary text-xs text-center font-medium">{item.name}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
