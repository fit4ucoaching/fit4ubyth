import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../../components/Button/Button";
import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { OnboardingProgressBar } from "../OnboardingProgressBar";

type Props = NativeStackScreenProps<OnboardingStackParamList, "TeddyIntro">;

/** Présentation de Teddy (Volume 4) — moment clé pour installer la relation avec le coach IA. */
export function TeddyIntroStep({ navigation }: Props): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <OnboardingProgressBar step={9} totalSteps={10} />
      <View className="flex-1 items-center justify-center px-xl gap-lg">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
          <Sparkles size={44} color="#FFFFFF" />
        </View>
        <Text className="text-textPrimary text-2xl font-bold text-center">Voici Teddy</Text>
        <Text className="text-textSecondary text-base text-center">
          Ton coach IA personnel. Il connaît déjà tes objectifs, ton niveau et tes préférences —
          il va t'accompagner à chaque séance, chaque repas, chaque victoire.
        </Text>
      </View>
      <View className="px-xl pb-xl">
        <Button label="Super, continuons" fullWidth onPress={() => navigation.navigate("Notifications")} />
      </View>
    </SafeAreaView>
  );
}
