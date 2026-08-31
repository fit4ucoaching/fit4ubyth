import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../components/Badge/Badge";
import { useOrders } from "../../services/useShop";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente", PROCESSING: "En traitement", SHIPPED: "Expédiée",
  DELIVERED: "Livrée", CANCELLED: "Annulée", REFUNDED: "Remboursée",
};

export function OrdersScreen(): JSX.Element {
  const { data } = useOrders();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="text-textPrimary text-2xl font-bold px-lg pt-sm pb-md">Mes commandes</Text>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-sm px-lg pb-xxl"
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-lg bg-surface p-md">
            <Text className="text-textPrimary">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
            <Badge label={STATUS_LABEL[item.status] ?? item.status} variant="primary" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
