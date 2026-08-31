import { Target } from "lucide-react-native";
import { Text, View } from "react-native";

import { Card } from "../../../components/Card/Card";
import { Progress } from "../../../components/Progress/Progress";
import type { GoalDTO } from "@fit4u/types";

export function GoalWidget({ goal }: { goal?: GoalDTO }): JSX.Element {
  if (!goal) {
    return (
      <Card variant="elevated" padding="lg" className="gap-sm">
        <View className="flex-row items-center gap-xs">
          <Target size={16} color="#FF6B00" />
          <Text className="text-textSecondary text-xs uppercase font-semibold">Objectif</Text>
        </View>
        <Text className="text-textSecondary text-sm">Aucun objectif défini pour le moment.</Text>
      </Card>
    );
  }

  const progressPercent =
    goal.targetValue && goal.currentValue ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;

  return (
    <Card variant="elevated" padding="lg" className="gap-sm">
      <View className="flex-row items-center gap-xs">
        <Target size={16} color="#FF6B00" />
        <Text className="text-textSecondary text-xs uppercase font-semibold">Objectif</Text>
      </View>
      <Text className="text-textPrimary font-semibold">{goal.title}</Text>
      <Progress value={progressPercent} />
    </Card>
  );
}
