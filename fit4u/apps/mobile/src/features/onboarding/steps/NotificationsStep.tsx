import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { Bell } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../../components/Button/Button";
import type { OnboardingStackParamList } from "../../../navigation/OnboardingNavigator";
import { useOnboardingDraft } from "../OnboardingContext";
import { OnboardingProgressBar } from "../OnboardingProgressBar";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Notifications">;

export function NotificationsStep({ navigation }: Props): JSX.Element {
  const { updateDraft } = useOnboardingDraft();

  const handleEnable = async (): Promise<void> => {
    const { status } = await Notifications.requestPermissionsAsync();
    updateDraft({ notificationsEnabled: status === "granted" });
    navigation.navigate("Complete");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <OnboardingProgressBar step={10} totalSteps={10} />
      <View className="flex-1 items-center justify-center px-xl gap-lg">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-surfaceElevated">
          <Bell size={32} color="#FF6B00" />
        </View>
        <Text className="text-textPrimary text-2xl font-bold text-center">Reste motivé</Text>
        <Text className="text-textSecondary text-base text-center">
          Active les notifications pour recevoir tes rappels de séance, tes défis et les messages de Teddy.
        </Text>
      </View>
      <View className="gap-sm px-xl pb-xl">
        <Button label="Activer les notifications" fullWidth onPress={() => void handleEnable()} />
        <Button
          label="Plus tard"
          variant="ghost"
          fullWidth
          onPress={() => {
            updateDraft({ notificationsEnabled: false });
            navigation.navigate("Complete");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
