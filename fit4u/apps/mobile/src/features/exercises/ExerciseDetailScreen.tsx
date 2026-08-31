import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Heart, Sparkles } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../components/Badge/Badge";
import { Card } from "../../components/Card/Card";
import type { ExercisesStackParamList } from "../../navigation/ExercisesNavigator";
import { useExercise, useToggleFavoriteExercise } from "../../services/useExercises";
import { useTeddyStore } from "../../store/teddyStore";

type Props = NativeStackScreenProps<ExercisesStackParamList, "ExerciseDetail">;

/**
 * Détail exercice (Volume 4) — image/vidéo, muscles, matériel, niveau,
 * conseils, erreurs fréquentes. "Animation Teddy" = ouverture directe de la
 * bulle Teddy avec le contexte de l'exercice pré-rempli, plutôt qu'une
 * animation vidéo dédiée par exercice (coût de production hors périmètre
 * frontend, cohérent avec la présence transverse de Teddy — Volume 4).
 */
export function ExerciseDetailScreen({ route }: Props): JSX.Element {
  const { data: exercise } = useExercise(route.params.exerciseId);
  const toggleFavorite = useToggleFavoriteExercise();
  const { toggleBubble, addMessage } = useTeddyStore();

  if (!exercise) return <SafeAreaView className="flex-1 bg-background" />;

  const askTeddy = (): void => {
    addMessage({
      id: crypto.randomUUID(),
      role: "system",
      content: `L'utilisateur consulte l'exercice "${exercise.name}".`,
      createdAt: new Date().toISOString(),
    });
    toggleBubble(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-xxl">
        <View className="h-64 w-full bg-surface">
          {exercise.images[0] ? (
            <Image source={{ uri: exercise.images[0].url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : null}
          <Pressable
            onPress={() => toggleFavorite.mutate(exercise.id)}
            accessibilityLabel="Basculer favori"
            className="absolute right-lg top-lg rounded-full bg-overlay p-sm"
          >
            <Heart size={20} color="#FFFFFF" fill={exercise.isFavorite ? "#FF6B00" : "transparent"} />
          </Pressable>
        </View>

        <View className="gap-lg px-lg py-lg">
          <View className="gap-sm">
            <Text className="text-textPrimary text-2xl font-bold">{exercise.name}</Text>
            <View className="flex-row gap-xs">
              <Badge label={exercise.difficultyLevel} variant="primary" />
              {exercise.caloriesPerMinute ? <Badge label={`${exercise.caloriesPerMinute} kcal/min`} variant="neutral" /> : null}
            </View>
          </View>

          {exercise.description ? <Text className="text-textSecondary text-sm">{exercise.description}</Text> : null}

          {exercise.instructions ? (
            <Card variant="flat" padding="md" className="gap-xs">
              <Text className="text-textPrimary font-semibold">Instructions</Text>
              <Text className="text-textSecondary text-sm">{exercise.instructions}</Text>
            </Card>
          ) : null}

          {exercise.tips.length > 0 ? (
            <Card variant="flat" padding="md" className="gap-xs">
              <Text className="text-textPrimary font-semibold">Conseils</Text>
              {exercise.tips.map((tip, i) => (
                <Text key={i} className="text-textSecondary text-sm">• {tip}</Text>
              ))}
            </Card>
          ) : null}

          {exercise.mistakes.length > 0 ? (
            <Card variant="flat" padding="md" className="gap-xs">
              <Text className="text-textPrimary font-semibold">Erreurs fréquentes</Text>
              {exercise.mistakes.map((mistake, i) => (
                <Text key={i} className="text-danger text-sm">• {mistake}</Text>
              ))}
            </Card>
          ) : null}

          <Pressable
            onPress={askTeddy}
            className="flex-row items-center justify-center gap-sm rounded-lg border border-primary/30 bg-primary/10 p-md"
          >
            <Sparkles size={18} color="#FF6B00" />
            <Text className="text-primary font-semibold">Demander conseil à Teddy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
