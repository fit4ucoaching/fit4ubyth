import type { RecipeDTO } from "@fit4u/types";
import { Image } from "expo-image";
import { ChefHat, Clock } from "lucide-react-native";
import { Text, View } from "react-native";

import { PressableCard } from "../Card/Card";

export interface RecipeCardProps {
  recipe: RecipeDTO;
  onPress: () => void;
}

/** Carte recette — nutrition (Volume 4). */
export function RecipeCard({ recipe, onPress }: RecipeCardProps): JSX.Element {
  return (
    <PressableCard onPress={onPress} padding="none" className="w-44 overflow-hidden">
      <View className="h-28 w-full bg-surface">
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ChefHat size={28} color="#767676" />
          </View>
        )}
      </View>
      <View className="gap-xs p-sm">
        <Text className="text-textPrimary font-semibold text-sm" numberOfLines={2}>{recipe.name}</Text>
        {recipe.prepTimeMinutes ? (
          <View className="flex-row items-center gap-xxs">
            <Clock size={12} color="#767676" />
            <Text className="text-textTertiary text-xs">{recipe.prepTimeMinutes} min</Text>
          </View>
        ) : null}
      </View>
    </PressableCard>
  );
}
