import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Logo } from "../../components/Logo/Logo";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { SocialAuthButtons } from "./SocialAuthButtons";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

/** Écran d'accueil pré-connexion — première impression premium de la marque. */
export function WelcomeScreen({ navigation }: Props): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background px-xl">
      <View className="flex-1 items-center justify-center gap-lg">
        <Logo size={140} />
        <Text className="text-textSecondary text-base text-center">
          Ton coach IA Teddy t'accompagne vers tes objectifs, chaque jour.
        </Text>
      </View>
      <View className="gap-sm pb-xl">
        <Button label="Créer un compte" variant="primary" size="lg" fullWidth onPress={() => navigation.navigate("Register")} />
        <Button label="J'ai déjà un compte" variant="outline" size="lg" fullWidth onPress={() => navigation.navigate("Login")} />
        <SocialAuthButtons />
      </View>
    </SafeAreaView>
  );
}
