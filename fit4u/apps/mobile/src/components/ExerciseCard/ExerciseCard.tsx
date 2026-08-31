import type { ExerciseDTO } from "@fit4u/types";
import { Image } from "expo-image";
import { Dumbbell, Heart } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Badge } from "../Badge/Badge";
import { PressableCard } from "../Card/Card";

export interface ExerciseCardProps {
  exercise: ExerciseDTO;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

const DIFFICULTY_LABEL: Record<ExerciseDTO["difficultyLevel"], string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
};

/** Carte exercice — liste/recherche/favoris (Volume 4 : image, niveau, favori). */
export function ExerciseCard({ exercise, onPress, onToggleFavorite }: ExerciseCardProps): JSX.Element {
  const thumbnail = exercise.images[0]?.url;

  return (
    <PressableCard onPress={onPress} padding="none" className="overflow-hidden">
      <View className="h-36 w-full bg-surface">
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Dumbbell size={32} color="#767676" />
          </View>
        )}
        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            accessibilityLabel="Basculer favori"
            className="absolute right-sm top-sm rounded-full bg-overlay p-xs"
          >
            <Heart size={16} color="#FFFFFF" fill={exercise.isFavorite ? "#FF6B00" : "transparent"} />
          </Pressable>
        ) : null}
      </View>
      <View className="gap-xs p-md">
        <Text className="text-textPrimary font-semibold" numberOfLines={1}>
          {exercise.name}
        </Text>
        <Badge label={DIFFICULTY_LABEL[exercise.difficultyLevel]} variant="neutral" />
      </View>
    </PressableCard>
  );
}
