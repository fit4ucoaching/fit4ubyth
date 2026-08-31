import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../components/Button/Button";
import { Sheet } from "../../components/Modal/Sheet";
import { useAnalyzeFoodPhoto } from "../../services/useNutrition";

export interface FoodPhotoAnalysisSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Analyse photo de repas via Teddy Vision (Volume 4). */
export function FoodPhotoAnalysisSheet({ visible, onClose }: FoodPhotoAnalysisSheetProps): JSX.Element {
  const analyzePhoto = useAnalyzeFoodPhoto();
  const [result, setResult] = useState<string | null>(null);

  const handlePickPhoto = async (): Promise<void> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const photo = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
    if (photo.canceled || !photo.assets[0]) return;

    const formData = new FormData();
    formData.append("photo", {
      uri: photo.assets[0].uri,
      name: "meal.jpg",
      type: "image/jpeg",
    } as unknown as Blob);

    analyzePhoto.mutate(formData, {
      onSuccess: (analysis) =>
        setResult(
          `${analysis.identifiedFoods.map((f) => f.name).join(", ")} — ~${analysis.estimatedCalories} kcal`,
        ),
    });
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="items-center gap-md py-lg">
        <Camera size={32} color="#FF6B00" />
        <Text className="text-textPrimary text-center font-semibold">Analyse ton repas en photo</Text>
        <Text className="text-textSecondary text-sm text-center">Teddy estime les calories et macros automatiquement.</Text>
        {result ? <Text className="text-primary text-sm font-medium text-center">{result}</Text> : null}
        <Button label="Prendre une photo" isLoading={analyzePhoto.isPending} onPress={() => void handlePickPhoto()} />
      </View>
    </Sheet>
  );
}
