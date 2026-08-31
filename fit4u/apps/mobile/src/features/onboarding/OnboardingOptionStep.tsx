import { Check } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";

export interface OnboardingOptionStepProps {
  title: string;
  subtitle?: string;
  options: { value: string; label: string; description?: string }[];
  selectedValues: string[];
  multiple?: boolean;
  onToggle: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
  step: number;
  totalSteps: number;
}

/**
 * Template réutilisé par les étapes à choix (Objectif, Niveau, Matériel,
 * Fréquence, Préférences alimentaires) — évite de dupliquer 5 écrans quasi
 * identiques tout en gardant chaque étape comme un écran de navigation à
 * part entière (Volume 4 : liste d'écrans d'onboarding explicite).
 */
export function OnboardingOptionStep({
  title,
  subtitle,
  options,
  selectedValues,
  multiple = false,
  onToggle,
  onNext,
  onBack,
  step,
  totalSteps,
}: OnboardingOptionStepProps): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-xl pt-sm">
        <Text className="text-textTertiary text-xs">{step} / {totalSteps}</Text>
      </View>
      <ScrollView contentContainerClassName="px-xl gap-lg py-lg" className="flex-1">
        <View className="gap-xs">
          <Text className="text-textPrimary text-2xl font-bold">{title}</Text>
          {subtitle ? <Text className="text-textSecondary text-sm">{subtitle}</Text> : null}
        </View>

        <View className="gap-sm">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => onToggle(option.value)}
                accessibilityRole={multiple ? "checkbox" : "radio"}
                accessibilityState={{ checked: isSelected }}
                className={`flex-row items-center justify-between rounded-lg border p-lg ${
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-surface"
                }`}
              >
                <View className="flex-1 gap-xxs">
                  <Text className="text-textPrimary font-semibold">{option.label}</Text>
                  {option.description ? <Text className="text-textSecondary text-xs">{option.description}</Text> : null}
                </View>
                {isSelected ? <Check size={20} color="#FF6B00" /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View className="flex-row gap-sm px-xl pb-xl">
        {onBack ? <Button label="Retour" variant="outline" onPress={onBack} /> : null}
        <View className="flex-1">
          <Button label="Continuer" fullWidth disabled={selectedValues.length === 0} onPress={onNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}
