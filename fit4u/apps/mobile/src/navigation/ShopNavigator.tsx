import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  CartScreen,
  CheckoutScreen,
  OrderConfirmationScreen,
  OrdersScreen,
  ProductDetailScreen,
  ShopScreen,
} from "../features/shop";

export type ShopStackParamList = {
  ShopHome: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  Orders: undefined;
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopHome" component={ShopScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: true, title: "" }} />
    </Stack.Navigator>
  );
}
