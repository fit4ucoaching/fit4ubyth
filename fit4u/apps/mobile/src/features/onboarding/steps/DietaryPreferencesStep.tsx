import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingOptionStep } from "../OnboardingOptionStep";

type Props = NativeStackScreenProps<OnboardingStackParamList, "DietaryPreferences">;

const DIET_OPTIONS = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarian", label: "Végétarien" },
  { value: "vegan", label: "Végan" },
  { value: "gluten_free", label: "Sans gluten" },
  { value: "lactose_free", label: "Sans lactose" },
];

export function DietaryPreferencesStep({ navigation }: Props): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();

  const toggle = (value: string): void => {
    const current = draft.dietaryPreferences;
    updateDraft({
      dietaryPreferences: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  return (
    <OnboardingOptionStep
      step={8}
      totalSteps={10}
      title="Des préférences alimentaires ?"
      subtitle="Teddy en tiendra compte pour tes menus"
      multiple
      options={DIET_OPTIONS}
      selectedValues={draft.dietaryPreferences}
      onToggle={toggle}
      onNext={() => navigation.navigate("TeddyIntro")}
      onBack={() => navigation.goBack()}
    />
  );
}
