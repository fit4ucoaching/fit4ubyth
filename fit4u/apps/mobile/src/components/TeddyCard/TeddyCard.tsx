import { Sparkles } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export interface TeddyCardProps {
  message: string;
  onPress: () => void;
}

/**
 * Carte Teddy — présence transverse du coach IA (Dashboard, séances,
 * nutrition, rapports — Volume 4). Toujours identifiable par son halo
 * orange caractéristique.
 */
export function TeddyCard({ message, onPress }: TeddyCardProps): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir Teddy"
      className="flex-row items-center gap-md rounded-lg border border-primary/30 bg-primary/10 p-lg"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
        <Sparkles size={22} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text className="text-primary text-xs font-bold uppercase">Teddy</Text>
        <Text className="text-textPrimary text-sm" numberOfLines={2}>{message}</Text>
      </View>
    </Pressable>
  );
}
