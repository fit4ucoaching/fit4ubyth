import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ShoppingCart } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "../../components/ProductCard/ProductCard";
import type { ShopStackParamList } from "../../navigation/ShopNavigator";
import { useCart, useProducts } from "../../services/useShop";
import { useShopStore } from "../../store/shopStore";

type Props = NativeStackScreenProps<ShopStackParamList, "ShopHome">;

/** Catalogue (cache Shopify — Volume 4). */
export function ShopScreen({ navigation }: Props): JSX.Element {
  const { data } = useProducts({});
  useCart(); // synchronise le badge panier (shopStore.cartItemCount)
  const cartItemCount = useShopStore((s) => s.cartItemCount);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-lg pt-sm pb-md">
        <Text className="text-textPrimary text-2xl font-bold">Boutique</Text>
        <Pressable onPress={() => navigation.navigate("Cart")} accessibilityLabel="Panier" className="relative">
          <ShoppingCart size={22} color="#B3B3B3" />
          {cartItemCount > 0 ? (
            <View className="absolute -right-2 -top-2 h-4 w-4 items-center justify-center rounded-full bg-primary">
              <Text className="text-white text-xs font-bold">{cartItemCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperClassName="gap-md px-lg"
        contentContainerClassName="gap-md pb-xxl"
        renderItem={({ item }) => (
          <View className="flex-1">
            <ProductCard product={item} onPress={() => navigation.navigate("ProductDetail", { productId: item.id })} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
