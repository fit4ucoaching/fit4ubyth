import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { Card } from "../Card/Card";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: { direction: "up" | "down"; label: string };
  accentColor?: string;
}

/** Carte statistique compacte — widgets du Dashboard (calories, pas, XP…). */
export function StatCard({ icon: Icon, label, value, trend, accentColor = "#FF6B00" }: StatCardProps): JSX.Element {
  return (
    <Card variant="elevated" padding="md" className="flex-1 gap-sm">
      <View className="flex-row items-center justify-between">
        <View className="rounded-md p-xs" style={{ backgroundColor: `${accentColor}22` }}>
          <Icon size={18} color={accentColor} />
        </View>
        {trend ? (
          <Text className={`text-xs font-semibold ${trend.direction === "up" ? "text-success" : "text-danger"}`}>
            {trend.direction === "up" ? "↑" : "↓"} {trend.label}
          </Text>
        ) : null}
      </View>
      <Text className="text-textPrimary text-2xl font-bold">{value}</Text>
      <Text className="text-textSecondary text-xs">{label}</Text>
    </Card>
  );
}
