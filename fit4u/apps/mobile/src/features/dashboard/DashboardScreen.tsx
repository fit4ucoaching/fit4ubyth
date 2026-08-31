import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Settings2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../components/Avatar/Avatar";
import { Badge } from "../../components/Badge/Badge";
import { Logo } from "../../components/Logo/Logo";
import { useTodaySteps } from "../../hooks/usePedometer";
import type { MainTabParamList } from "../../navigation/MainTabNavigator";
import { useGamificationProfile } from "../../services/useGamification";
import { useMe } from "../../services/useUsers";
import { useWorkoutStatistics } from "../../services/useWorkouts";
import { useAuthStore } from "../../store/authStore";
import { useNutritionStore } from "../../store/nutritionStore";
import { useUiStore, type DashboardWidgetId } from "../../store/uiStore";
import { TeddyCard } from "../../components/TeddyCard/TeddyCard";
import { DashboardCustomizeSheet } from "./DashboardCustomizeSheet";
import { GoalWidget, QuickStatsWidget, StreakXpWidget, TodaySessionWidget } from "./widgets";

type Props = NativeStackScreenProps<MainTabParamList, "Dashboard">;

/**
 * Tableau de bord personnalisable (Volume 4) — les widgets sont rendus dans
 * l'ordre de `uiStore.dashboardWidgetOrder`, modifiable via
 * `DashboardCustomizeSheet`. Chaque widget reste un composant autonome
 * (`features/dashboard/widgets/`), le Dashboard n'orchestre que le layout.
 */
export function DashboardScreen({ navigation }: Props): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const { data: me, refetch, isRefetching } = useMe();
  const { data: xp } = useGamificationProfile();
  const { data: workoutStats } = useWorkoutStatistics();
  const { todayWaterMl, dailyWaterGoalMl } = useNutritionStore();
  const { dashboardWidgetOrder } = useUiStore();
  const steps = useTodaySteps();
  const [isCustomizing, setIsCustomizing] = useState(false);

  const renderWidget = (widgetId: DashboardWidgetId): JSX.Element | null => {
    switch (widgetId) {
      case "todaySession":
        return (
          <TodaySessionWidget
            key={widgetId}
            suggestedTitle="Prêt pour ta séance ?"
            onStart={() => navigation.navigate("Workout", { screen: "ProgramsList" } as never)}
          />
        );
      case "teddy":
        return (
          <TeddyCard
            key={widgetId}
            message="Salut ! Je suis là si tu as besoin de conseils aujourd'hui 💪"
            onPress={() => navigation.navigate("Teddy" as never)}
          />
        );
      case "goal":
        return <GoalWidget key={widgetId} goal={undefined} />;
      case "streak":
      case "xp":
        return <StreakXpWidget key={widgetId} xp={xp} streakDays={0} />;
      case "calories":
      case "hydration":
      case "steps":
        return (
          <QuickStatsWidget
            key={widgetId}
            caloriesBurned={workoutStats?.totalCaloriesBurned ?? 0}
            waterMl={todayWaterMl}
            waterGoalMl={dailyWaterGoalMl}
            steps={steps ?? undefined}
          />
        );
      default:
        return null; // sleep/challenges/shop/community : widgets à activer au fil des volumes suivants
    }
  };

  // Certains widgets (calories/hydration/steps) sont fusionnés en une seule
  // grille QuickStatsWidget — on ne rend le groupe qu'une fois.
  const renderedGroups = new Set<string>();
  const orderedWidgets = dashboardWidgetOrder.filter((id) => {
    if (["calories", "hydration", "steps"].includes(id)) {
      if (renderedGroups.has("quickStats")) return false;
      renderedGroups.add("quickStats");
      return true;
    }
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-lg pt-sm pb-md">
        <View className="flex-row items-center gap-sm">
          <Logo size={32} />
          <View className="h-6 w-px bg-border" />
          <Avatar firstName={me?.profile.firstName} lastName={me?.profile.lastName} showVipRing={user?.isPremium} size="md" />
          <View>
            <Text className="text-textSecondary text-xs">Bonjour</Text>
            <Text className="text-textPrimary font-semibold">{me?.profile.firstName ?? "…"}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-sm">
          {user?.isPremium ? <Badge label="VIP" variant="vip" /> : null}
          <Pressable onPress={() => setIsCustomizing(true)} accessibilityLabel="Personnaliser le tableau de bord">
            <Settings2 size={20} color="#B3B3B3" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="px-lg gap-md pb-xxl"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor="#FF6B00" />}
      >
        {orderedWidgets.map(renderWidget)}
      </ScrollView>

      <DashboardCustomizeSheet visible={isCustomizing} onClose={() => setIsCustomizing(false)} />
    </SafeAreaView>
  );
}
