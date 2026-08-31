import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PartyPopper } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../../components/Button/Button";
import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useUpdatePreferences } from "../../../services/useProfiles";
import { useUpdateProfile } from "../../../services/useUsers";
import { useUiStore } from "../../../store/uiStore";
import { useOnboardingDraft } from "../OnboardingContext";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Complete">;

/**
 * Étape finale — envoie le brouillon d'onboarding vers `Profile` et
 * `UserPreference` (endpoints Volume 3 existants) pour que Teddy en dispose
 * dès la première conversation (`TeddyMemoryService.buildContext()` les lit
 * au fil de l'eau depuis ces mêmes tables).
 */
export function CompleteStep({ navigation }: Props): JSX.Element {
  const { draft } = useOnboardingDraft();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const pushToast = useUiStore((s) => s.pushToast);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await Promise.all([
        updateProfile.mutateAsync({ heightCm: draft.heightCm }),
        updatePreferences.mutateAsync({
          primaryGoal: draft.goalType,
          preferredEquipment: draft.availableEquipment,
        }),
      ]);
      // `weightKg` initial est enregistré comme première entrée d'historique
      // via `POST /progress/weight` (module `progress`, hors périmètre profil).
      navigation.getParent()?.reset({ index: 0, routes: [{ name: "Main" as never }] });
    } catch {
      pushToast({ variant: "error", message: "Une erreur est survenue, réessaie." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-xl gap-lg">
      <PartyPopper size={48} color="#FF6B00" />
      <Text className="text-textPrimary text-2xl font-bold text-center">Tout est prêt !</Text>
      <Text className="text-textSecondary text-base text-center">
        Teddy a déjà préparé ton profil. On y va ?
      </Text>
      <Button label="Accéder à Fit4U" size="lg" isLoading={isSubmitting} onPress={() => void handleFinish()} />
    </SafeAreaView>
  );
}
