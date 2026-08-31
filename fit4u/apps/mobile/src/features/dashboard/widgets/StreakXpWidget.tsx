import { Flame } from "lucide-react-native";
import { Text, View } from "react-native";

import { Card } from "../../../components/Card/Card";
import { CircularProgress } from "../../../components/CircularProgress/CircularProgress";
import type { UserXpDTO } from "@fit4u/types";

const XP_PER_LEVEL = 500;

export function StreakXpWidget({ xp, streakDays }: { xp?: UserXpDTO; streakDays: number }): JSX.Element {
  const xpInLevel = xp ? xp.totalXp % XP_PER_LEVEL : 0;

  return (
    <Card variant="elevated" padding="lg" className="flex-row items-center justify-between">
      <View className="gap-xs">
        <View className="flex-row items-center gap-xxs">
          <Flame size={16} color="#FF6B00" />
          <Text className="text-textPrimary font-bold text-lg">{streakDays} jours</Text>
        </View>
        <Text className="text-textSecondary text-xs">Série en cours</Text>
      </View>
      <CircularProgress
        value={(xpInLevel / XP_PER_LEVEL) * 100}
        size={64}
        strokeWidth={6}
        label={`Nv.${xp?.currentLevel ?? 1}`}
      />
    </Card>
  );
}
