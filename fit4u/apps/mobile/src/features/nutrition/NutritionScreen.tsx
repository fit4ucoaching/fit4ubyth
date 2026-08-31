import { Barcode, Camera, Droplets, Plus } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { Progress } from "../../components/Progress/Progress";
import { RecipeCard } from "../../components/RecipeCard/RecipeCard";
import { useLogWater, useRecipes, useScanBarcode } from "../../services/useNutrition";
import { useNutritionStore } from "../../store/nutritionStore";
import { useUiStore } from "../../store/uiStore";
import { BarcodeScannerSheet } from "./BarcodeScannerSheet";
import { FoodPhotoAnalysisSheet } from "./FoodPhotoAnalysisSheet";

const WATER_INCREMENT_ML = 250;

/**
 * Dashboard Nutrition (Volume 4) — hydratation, scan code-barres, analyse
 * photo, recettes suggérées. Le journal alimentaire détaillé (repas par
 * repas) et la liste de courses sont accessibles depuis ce hub plutôt que
 * dupliqués en onglets séparés, pour garder la navigation "Nutrition" à un
 * seul niveau profond depuis la tab bar.
 */
export function NutritionScreen(): JSX.Element {
  const { todayWaterMl, dailyWaterGoalMl } = useNutritionStore();
  const logWater = useLogWater();
  const scanBarcode = useScanBarcode();
  const { data: recipes } = useRecipes();
  const pushToast = useUiStore((s) => s.pushToast);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPhotoAnalysisOpen, setIsPhotoAnalysisOpen] = useState(false);

  const handleBarcodeScanned = (barcode: string): void => {
    setIsScannerOpen(false);
    scanBarcode.mutate(barcode, {
      onSuccess: (food) => pushToast({ variant: "success", message: `${food.name} trouvé — ${food.caloriesPer100g} kcal/100g` }),
      onError: () => pushToast({ variant: "error", message: "Aucun aliment trouvé pour ce code-barres." }),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-lg">
        <Text className="text-textPrimary text-2xl font-bold">Nutrition</Text>

        <Card variant="elevated" padding="lg" className="gap-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-xs">
              <Droplets size={18} color="#3B9EFF" />
              <Text className="text-textPrimary font-semibold">Hydratation</Text>
            </View>
            <Text className="text-textSecondary text-sm">
              {(todayWaterMl / 1000).toFixed(1)}L / {(dailyWaterGoalMl / 1000).toFixed(1)}L
            </Text>
          </View>
          <Progress value={(todayWaterMl / dailyWaterGoalMl) * 100} variant="primary" />
          <Button
            label={`+ ${WATER_INCREMENT_ML}ml`}
            variant="outline"
            leftIcon={<Plus size={16} color="#FFFFFF" />}
            onPress={() => logWater.mutate(WATER_INCREMENT_ML)}
          />
        </Card>

        <View className="flex-row gap-sm">
          <Pressable
            onPress={() => setIsScannerOpen(true)}
            className="flex-1 items-center gap-xs rounded-lg border border-border bg-surface p-lg"
          >
            <Barcode size={22} color="#FF6B00" />
            <Text className="text-textPrimary text-xs font-medium">Scanner</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsPhotoAnalysisOpen(true)}
            className="flex-1 items-center gap-xs rounded-lg border border-border bg-surface p-lg"
          >
            <Camera size={22} color="#FF6B00" />
            <Text className="text-textPrimary text-xs font-medium">Photo repas</Text>
          </Pressable>
        </View>

        <View className="gap-sm">
          <Text className="text-textPrimary font-semibold">Recettes suggérées</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recipes?.items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-sm"
            renderItem={({ item }) => <RecipeCard recipe={item} onPress={() => undefined} />}
          />
        </View>
      </ScrollView>

      <BarcodeScannerSheet visible={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanned={handleBarcodeScanned} />
      <FoodPhotoAnalysisSheet visible={isPhotoAnalysisOpen} onClose={() => setIsPhotoAnalysisOpen(false)} />
    </SafeAreaView>
  );
}
