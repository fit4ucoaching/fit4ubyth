import { Droplets, Flame as CaloriesIcon, Footprints, Moon } from "lucide-react-native";
import { View } from "react-native";

import { StatCard } from "../../../components/StatCard/StatCard";

export interface QuickStatsWidgetProps {
  caloriesBurned: number;
  waterMl: number;
  waterGoalMl: number;
  steps?: number;
  sleepHours?: number;
}

/** Widgets Calories/Hydratation/Pas/Sommeil regroupés en grille 2×2 (Volume 4). */
export function QuickStatsWidget({ caloriesBurned, waterMl, waterGoalMl, steps, sleepHours }: QuickStatsWidgetProps): JSX.Element {
  return (
    <View className="flex-row flex-wrap gap-sm">
      <StatCard icon={CaloriesIcon} label="Calories brûlées" value={String(caloriesBurned)} accentColor="#FF6B00" />
      <StatCard icon={Droplets} label={`Hydratation / ${waterGoalMl / 1000}L`} value={`${(waterMl / 1000).toFixed(1)}L`} accentColor="#3B9EFF" />
      {steps !== undefined ? <StatCard icon={Footprints} label="Pas" value={String(steps)} accentColor="#2ECC71" /> : null}
      {sleepHours !== undefined ? <StatCard icon={Moon} label="Sommeil" value={`${sleepHours}h`} accentColor="#8B5CF6" /> : null}
    </View>
  );
}
