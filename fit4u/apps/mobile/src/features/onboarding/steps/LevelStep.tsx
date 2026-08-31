import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingOptionStep } from "../OnboardingOptionStep";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Level">;

const LEVEL_OPTIONS = [
  { value: "BEGINNER", label: "Débutant", description: "Je découvre le sport ou je reprends" },
  { value: "INTERMEDIATE", label: "Intermédiaire", description: "Je m'entraîne régulièrement" },
  { value: "ADVANCED", label: "Avancé", description: "Je m'entraîne intensément depuis longtemps" },
];

export function LevelStep({ navigation }: Props): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();

  return (
    <OnboardingOptionStep
      step={3}
      totalSteps={10}
      title="Quel est ton niveau ?"
      options={LEVEL_OPTIONS}
      selectedValues={draft.fitnessLevel ? [draft.fitnessLevel] : []}
      onToggle={(value) => updateDraft({ fitnessLevel: value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" })}
      onNext={() => navigation.navigate("Equipment")}
      onBack={() => navigation.goBack()}
    />
  );
}
