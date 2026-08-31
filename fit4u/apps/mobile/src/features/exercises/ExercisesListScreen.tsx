import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExerciseCard } from "../../components/ExerciseCard/ExerciseCard";
import { Input } from "../../components/Input/Input";
import { SkeletonCard } from "../../components/Skeleton/Skeleton";
import { useDebounce } from "../../hooks/useDebounce";
import type { ExercisesStackParamList } from "../../navigation/ExercisesNavigator";
import { useExerciseSearch, useExercises, useToggleFavoriteExercise } from "../../services/useExercises";

type Props = NativeStackScreenProps<ExercisesStackParamList, "ExercisesList">;

/** Liste + recherche + filtres + favoris (Volume 4). */
export function ExercisesListScreen({ navigation }: Props): JSX.Element {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const isSearching = debouncedSearch.length > 0;

  const listQuery = useExercises({});
  const searchQuery = useExerciseSearch(debouncedSearch);
  const toggleFavorite = useToggleFavoriteExercise();

  const items = isSearching ? (searchQuery.data?.items ?? []) : (listQuery.data?.pages.flatMap((p) => p.items) ?? []);
  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-lg pt-sm pb-md gap-md">
        <Input
          placeholder="Rechercher un exercice…"
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={18} color="#767676" />}
          accessibilityLabel="Rechercher un exercice"
        />
      </View>

      {isLoading ? (
        <View className="gap-md px-lg">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperClassName="gap-md px-lg"
          contentContainerClassName="gap-md pb-xxl"
          onEndReached={() => !isSearching && listQuery.fetchNextPage()}
          renderItem={({ item }) => (
            <View className="flex-1">
              <ExerciseCard
                exercise={item}
                onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: item.id })}
                onToggleFavorite={() => toggleFavorite.mutate(item.id)}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
