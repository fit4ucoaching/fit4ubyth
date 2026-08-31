import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2 } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import type { ShopStackParamList } from "../../navigation/ShopNavigator";

type Props = NativeStackScreenProps<ShopStackParamList, "OrderConfirmation">;

export function OrderConfirmationScreen({ navigation }: Props): JSX.Element {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-xl gap-lg">
      <CheckCircle2 size={48} color="#2ECC71" />
      <Text className="text-textPrimary text-2xl font-bold text-center">Commande confirmée !</Text>
      <Button label="Voir mes commandes" onPress={() => navigation.navigate("Orders")} />
    </SafeAreaView>
  );
}
