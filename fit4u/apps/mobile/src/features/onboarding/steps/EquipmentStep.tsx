import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingOptionStep } from "../OnboardingOptionStep";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Equipment">;

const EQUIPMENT_OPTIONS = [
  { value: "BODYWEIGHT", label: "Poids du corps uniquement" },
  { value: "DUMBBELLS", label: "Haltères" },
  { value: "BARBELL", label: "Barre" },
  { value: "RESISTANCE_BAND", label: "Élastiques" },
  { value: "KETTLEBELL", label: "Kettlebell" },
  { value: "MACHINE", label: "Machines de salle" },
];

export function EquipmentStep({ navigation }: Props): JSX.Element {
  const { draft, updateDraft } = useOnboardingDraft();

  const toggle = (value: string): void => {
    const current = draft.availableEquipment;
    updateDraft({
      availableEquipment: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  return (
    <OnboardingOptionStep
      step={4}
      totalSteps={10}
      title="Quel matériel as-tu à disposition ?"
      subtitle="Plusieurs choix possibles"
      multiple
      options={EQUIPMENT_OPTIONS}
      selectedValues={draft.availableEquipment}
      onToggle={toggle}
      onNext={() => navigation.navigate("Frequency")}
      onBack={() => navigation.goBack()}
    />
  );
}
