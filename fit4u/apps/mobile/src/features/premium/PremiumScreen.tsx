import { Check, Crown, X } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { useCreatePaymentIntent } from "../../services/usePayments";
import { useAuthStore } from "../../store/authStore";

const FEATURES = [
  { label: "Programmes illimités", free: false, premium: true },
  { label: "Génération IA de programmes", free: false, premium: true },
  { label: "Recettes premium", free: false, premium: true },
  { label: "Analyse photo des repas", free: false, premium: true },
  { label: "Suivi de base", free: true, premium: true },
  { label: "Communauté", free: true, premium: true },
];

/**
 * Présentation Premium/VIP (Volume 4) — "Si l'utilisateur est VIP : tous
 * les paywalls sont supprimés, afficher le badge VIP." Cet écran reste
 * accessible aux VIP (gestion d'abonnement) mais masque les CTA d'achat.
 */
export function PremiumScreen(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const createIntent = useCreatePaymentIntent();
  const isVip = user?.isPremium ?? false;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-lg">
        <View className="items-center gap-sm">
          <Crown size={40} color="#FF6B00" />
          <Text className="text-textPrimary text-2xl font-bold text-center">Fit4U Premium</Text>
          {isVip ? <Badge label="Tu es VIP ✨" variant="vip" /> : null}
        </View>

        <Card variant="elevated" padding="lg" className="gap-sm">
          {FEATURES.map((feature) => (
            <View key={feature.label} className="flex-row items-center justify-between py-xs">
              <Text className="text-textPrimary text-sm flex-1">{feature.label}</Text>
              <View className="w-16 flex-row justify-around">
                {feature.free ? <Check size={16} color="#767676" /> : <X size={16} color="#2A2A2A" />}
                {feature.premium ? <Check size={16} color="#FF6B00" /> : <X size={16} color="#2A2A2A" />}
              </View>
            </View>
          ))}
        </Card>

        {!isVip ? (
          <View className="gap-sm">
            <Button
              label="S'abonner — 9,99€/mois"
              size="lg"
              fullWidth
              isLoading={createIntent.isPending}
              onPress={() => createIntent.mutate({ orderId: "subscription", provider: "stripe" })}
            />
            <Text className="text-textTertiary text-xs text-center">Résiliable à tout moment depuis les Paramètres.</Text>
          </View>
        ) : (
          <Button label="Gérer mon abonnement" variant="outline" fullWidth onPress={() => undefined} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
