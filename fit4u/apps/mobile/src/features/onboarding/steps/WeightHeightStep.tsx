import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingProgressBar } from "../OnboardingProgressBar";

type WeightProps = NativeStackScreenProps<OnboardingStackParamList, "Weight">;
type HeightProps = NativeStackScreenProps<OnboardingStackParamList, "Height">;

export function WeightStep({ navigation }: WeightProps): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();
  const [value, setValue] = useState(draft.weightKg ? String(draft.weightKg) : "");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <OnboardingProgressBar step={6} totalSteps={10} />
      <View className="flex-1 justify-center px-xl gap-lg">
        <Text className="text-textPrimary text-2xl font-bold">Quel est ton poids actuel ?</Text>
        <Input
          keyboardType="numeric"
          placeholder="70"
          value={value}
          onChangeText={setValue}
          rightIcon={<Text className="text-textSecondary">kg</Text>}
          accessibilityLabel="Poids en kilogrammes"
        />
      </View>
      <View className="px-xl pb-xl">
        <Button
          label="Continuer"
          fullWidth
          disabled={!value}
          onPress={() => {
            updateDraft({ weightKg: Number(value) });
            navigation.navigate("Height");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export function HeightStep({ navigation }: HeightProps): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();
  const [value, setValue] = useState(draft.heightCm ? String(draft.heightCm) : "");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <OnboardingProgressBar step={7} totalSteps={10} />
      <View className="flex-1 justify-center px-xl gap-lg">
        <Text className="text-textPrimary text-2xl font-bold">Et ta taille ?</Text>
        <Input
          keyboardType="numeric"
          placeholder="175"
          value={value}
          onChangeText={setValue}
          rightIcon={<Text className="text-textSecondary">cm</Text>}
          accessibilityLabel="Taille en centimètres"
        />
      </View>
      <View className="px-xl pb-xl">
        <Button
          label="Continuer"
          fullWidth
          disabled={!value}
          onPress={() => {
            updateDraft({ heightCm: Number(value) });
            navigation.navigate("DietaryPreferences");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
