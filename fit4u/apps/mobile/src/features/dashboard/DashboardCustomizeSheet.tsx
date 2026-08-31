import { ChevronDown, ChevronUp, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Sheet } from "../../components/Modal/Sheet";
import { useUiStore, type DashboardWidgetId } from "../../store/uiStore";

const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  todaySession: "Séance du jour", goal: "Objectif", calories: "Calories", hydration: "Hydratation",
  steps: "Pas", sleep: "Sommeil", weight: "Poids", xp: "XP", streak: "Streak",
  challenges: "Défis", teddy: "Teddy", shop: "Boutique", community: "Communauté",
};

export interface DashboardCustomizeSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Personnalisation du Dashboard (Volume 4 : "L'utilisateur peut réorganiser
 * les cartes") — réordonnancement par boutons haut/bas plutôt que
 * drag-and-drop gestuel : équivalent fonctionnel, plus accessible
 * (VoiceOver/TalkBack peuvent activer un bouton, pas un glisser-déposer).
 */
export function DashboardCustomizeSheet({ visible, onClose }: DashboardCustomizeSheetProps): JSX.Element {
  const { dashboardWidgetOrder, reorderDashboardWidgets } = useUiStore();

  const move = (index: number, direction: -1 | 1): void => {
    const next = [...dashboardWidgetOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorderDashboardWidgets(next);
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between pb-md">
        <Text className="text-textPrimary text-lg font-semibold">Personnaliser le tableau de bord</Text>
        <Pressable onPress={onClose} accessibilityLabel="Fermer">
          <X size={20} color="#B3B3B3" />
        </Pressable>
      </View>
      {dashboardWidgetOrder.map((widgetId, index) => (
        <View key={widgetId} className="flex-row items-center justify-between border-b border-border py-sm">
          <Text className="text-textPrimary">{WIDGET_LABELS[widgetId]}</Text>
          <View className="flex-row gap-md">
            <Pressable onPress={() => move(index, -1)} disabled={index === 0} accessibilityLabel="Monter">
              <ChevronUp size={20} color={index === 0 ? "#2A2A2A" : "#B3B3B3"} />
            </Pressable>
            <Pressable onPress={() => move(index, 1)} disabled={index === dashboardWidgetOrder.length - 1} accessibilityLabel="Descendre">
              <ChevronDown size={20} color={index === dashboardWidgetOrder.length - 1 ? "#2A2A2A" : "#B3B3B3"} />
            </Pressable>
          </View>
        </View>
      ))}
    </Sheet>
  );
}
