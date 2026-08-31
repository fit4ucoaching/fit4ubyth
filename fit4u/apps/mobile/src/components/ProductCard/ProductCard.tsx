import type { ProductDTO } from "@fit4u/types";
import { Image } from "expo-image";
import { Package } from "lucide-react-native";
import { Text, View } from "react-native";

import { PressableCard } from "../Card/Card";

export interface ProductCardProps {
  product: ProductDTO;
  onPress: () => void;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

/** Carte produit — boutique Shopify (Volume 4). */
export function ProductCard({ product, onPress }: ProductCardProps): JSX.Element {
  return (
    <PressableCard onPress={onPress} padding="none" className="w-40 overflow-hidden">
      <View className="h-32 w-full bg-surface">
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Package size={26} color="#767676" />
          </View>
        )}
      </View>
      <View className="gap-xxs p-sm">
        <Text className="text-textPrimary font-semibold text-sm" numberOfLines={2}>{product.name}</Text>
        <Text className="text-primary font-bold text-sm">{formatPrice(product.priceCents, product.currency)}</Text>
      </View>
    </PressableCard>
  );
}
