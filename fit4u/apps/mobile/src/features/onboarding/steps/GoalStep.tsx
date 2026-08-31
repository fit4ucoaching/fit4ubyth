import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingOptionStep } from "../OnboardingOptionStep";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Goal">;

const GOAL_OPTIONS = [
  { value: "WEIGHT_LOSS", label: "Perte de poids" },
  { value: "MUSCLE_GAIN", label: "Prise de masse" },
  { value: "MAINTENANCE", label: "Maintien de la forme" },
  { value: "PERFORMANCE", label: "Performance sportive" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "MOBILITY", label: "Mobilité & souplesse" },
];

export function GoalStep({ navigation }: Props): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();

  return (
    <OnboardingOptionStep
      step={2}
      totalSteps={10}
      title="Quel est ton objectif principal ?"
      options={GOAL_OPTIONS}
      selectedValues={draft.goalType ? [draft.goalType] : []}
      onToggle={(value) => updateDraft({ goalType: value })}
      onNext={() => navigation.navigate("Level")}
      onBack={() => navigation.goBack()}
    />
  );
}
