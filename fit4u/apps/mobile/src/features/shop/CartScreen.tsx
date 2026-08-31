import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import type { ShopStackParamList } from "../../navigation/ShopNavigator";
import { useCart } from "../../services/useShop";

type Props = NativeStackScreenProps<ShopStackParamList, "Cart">;

function formatPrice(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

export function CartScreen({ navigation }: Props): JSX.Element {
  const { data: cart } = useCart();
  const total = (cart?.items ?? []).reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="text-textPrimary text-2xl font-bold px-lg pt-sm pb-md">Panier</Text>
      <FlatList
        data={cart?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-sm px-lg"
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-lg bg-surface p-md">
            <Text className="text-textPrimary flex-1">{item.product.name} × {item.quantity}</Text>
            <Text className="text-textPrimary font-semibold">{formatPrice(item.product.priceCents * item.quantity, item.product.currency)}</Text>
          </View>
        )}
      />
      <View className="gap-sm px-lg pb-xl pt-md">
        <View className="flex-row justify-between">
          <Text className="text-textSecondary">Total</Text>
          <Text className="text-textPrimary text-lg font-bold">{formatPrice(total)}</Text>
        </View>
        <Button label="Passer commande" size="lg" fullWidth disabled={!cart?.items.length} onPress={() => navigation.navigate("Checkout")} />
      </View>
    </SafeAreaView>
  );
}
