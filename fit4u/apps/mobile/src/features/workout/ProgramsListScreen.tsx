import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProgramCard } from "../../components/ProgramCard/ProgramCard";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import type { WorkoutStackParamList } from "../../navigation/WorkoutNavigator";
import { usePrograms } from "../../services/usePrograms";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<WorkoutStackParamList, "ProgramsList">;

export function ProgramsListScreen({ navigation }: Props): JSX.Element {
  const { data, isLoading } = usePrograms({});
  const isPremium = useAuthStore((s) => s.user?.isPremium ?? false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-lg pt-sm pb-md">
        <Text className="text-textPrimary text-2xl font-bold">Programmes</Text>
      </View>
      {isLoading ? (
        <View className="gap-md px-lg">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperClassName="gap-md px-lg"
          contentContainerClassName="gap-md pb-xxl"
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProgramCard
                program={item}
                isUserPremium={isPremium}
                onPress={() => navigation.navigate("ProgramDetail", { programId: item.id })}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
