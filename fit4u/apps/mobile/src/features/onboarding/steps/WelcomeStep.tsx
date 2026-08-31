import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../../components/Button/Button";
import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeStep({ navigation }: Props): JSX.Element {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-xl gap-lg">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
        <Sparkles size={36} color="#FFFFFF" />
      </View>
      <Text className="text-textPrimary text-2xl font-bold text-center">Bienvenue sur Fit4U</Text>
      <Text className="text-textSecondary text-base text-center">
        Quelques questions pour que Teddy personnalise ton expérience dès aujourd'hui.
      </Text>
      <Button label="Commencer" size="lg" onPress={() => navigation.navigate("Goal")} />
    </SafeAreaView>
  );
}
