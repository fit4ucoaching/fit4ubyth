import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingOptionStep } from "../OnboardingOptionStep";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Frequency">;

const FREQUENCY_OPTIONS = [
  { value: "2", label: "2 séances / semaine" },
  { value: "3", label: "3 séances / semaine" },
  { value: "4", label: "4 séances / semaine" },
  { value: "5", label: "5+ séances / semaine" },
];

export function FrequencyStep({ navigation }: Props): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();

  return (
    <OnboardingOptionStep
      step={5}
      totalSteps={10}
      title="À quelle fréquence veux-tu t'entraîner ?"
      options={FREQUENCY_OPTIONS}
      selectedValues={draft.sessionsPerWeek ? [String(draft.sessionsPerWeek)] : []}
      onToggle={(value) => updateDraft({ sessionsPerWeek: Number(value) })}
      onNext={() => navigation.navigate("Weight")}
      onBack={() => navigation.goBack()}
    />
  );
}
