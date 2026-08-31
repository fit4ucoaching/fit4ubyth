import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import type { ShopStackParamList } from "../../navigation/ShopNavigator";
import { useAddCartItem, useProduct } from "../../services/useShop";

type Props = NativeStackScreenProps<ShopStackParamList, "ProductDetail">;

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

export function ProductDetailScreen({ route }: Props): JSX.Element {
  const { data: product } = useProduct(route.params.productId);
  const addCartItem = useAddCartItem();

  if (!product) return <SafeAreaView className="flex-1 bg-background" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-xxl">
        <View className="h-72 w-full bg-surface">
          {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" /> : null}
        </View>
        <View className="gap-md px-lg py-lg">
          <Text className="text-textPrimary text-2xl font-bold">{product.name}</Text>
          <Text className="text-primary text-xl font-bold">{formatPrice(product.priceCents, product.currency)}</Text>
          {product.description ? <Text className="text-textSecondary text-sm">{product.description}</Text> : null}
        </View>
      </ScrollView>
      <View className="px-lg pb-xl">
        <Button
          label={product.stockQuantity > 0 ? "Ajouter au panier" : "Rupture de stock"}
          size="lg"
          fullWidth
          disabled={product.stockQuantity === 0}
          isLoading={addCartItem.isPending}
          onPress={() => addCartItem.mutate({ productId: product.id, quantity: 1 })}
        />
      </View>
    </SafeAreaView>
  );
}
