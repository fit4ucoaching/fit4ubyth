import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { useCreatePaymentIntent } from "../../services/usePayments";
import { useCheckout } from "../../services/useShop";
import { useUiStore } from "../../store/uiStore";
import type { ShopStackParamList } from "../../navigation/ShopNavigator";

type Props = NativeStackScreenProps<ShopStackParamList, "Checkout">;

/**
 * Checkout (Volume 4) — crée la commande puis l'intention de paiement.
 * L'étape de saisie carte elle-même est déléguée au SDK natif Stripe
 * (`@stripe/stripe-react-native`, non détaillé ici) une fois le
 * `clientSecret` obtenu — point d'intégration standard, hors périmètre du
 * flux de navigation.
 */
export function CheckoutScreen({ navigation }: Props): JSX.Element {
  const checkout = useCheckout();
  const createIntent = useCreatePaymentIntent();
  const pushToast = useUiStore((s) => s.pushToast);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "apple_pay" | "google_pay">("stripe");
  const [address, setAddress] = useState({ line1: "", city: "", postalCode: "", country: "FR" });

  const handleCheckout = (): void => {
    checkout.mutate(
      { shippingAddress: address, paymentMethod },
      {
        onSuccess: (order) => {
          createIntent.mutate(
            { orderId: order.id, provider: paymentMethod },
            {
              onSuccess: () => navigation.navigate("OrderConfirmation", { orderId: order.id }),
              onError: () => pushToast({ variant: "error", message: "Paiement impossible." }),
            },
          );
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-lg">
        <Text className="text-textPrimary text-2xl font-bold">Livraison & paiement</Text>
        <Input label="Adresse" value={address.line1} onChangeText={(v) => setAddress({ ...address, line1: v })} />
        <Input label="Ville" value={address.city} onChangeText={(v) => setAddress({ ...address, city: v })} />
        <Input label="Code postal" value={address.postalCode} onChangeText={(v) => setAddress({ ...address, postalCode: v })} />

        <View className="gap-xs">
          <Text className="text-textSecondary text-sm font-medium">Méthode de paiement</Text>
          <SegmentedControl
            options={[
              { value: "stripe", label: "Carte" },
              { value: "apple_pay", label: "Apple Pay" },
              { value: "google_pay", label: "Google Pay" },
            ]}
            value={paymentMethod}
            onChange={setPaymentMethod}
          />
        </View>
      </ScrollView>
      <View className="px-lg pb-xl">
        <Button label="Payer" size="lg" fullWidth isLoading={checkout.isPending || createIntent.isPending} onPress={handleCheckout} />
      </View>
    </SafeAreaView>
  );
}
