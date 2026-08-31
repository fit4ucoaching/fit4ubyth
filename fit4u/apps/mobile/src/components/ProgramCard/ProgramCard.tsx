import type { ProgramSummaryDTO } from "@fit4u/types";
import { Image } from "expo-image";
import { Crown, Flame } from "lucide-react-native";
import { Text, View } from "react-native";

import { Badge } from "../Badge/Badge";
import { PressableCard } from "../Card/Card";

export interface ProgramCardProps {
  program: ProgramSummaryDTO;
  onPress: () => void;
  isUserPremium?: boolean;
}

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: "Perte de poids", MUSCLE_GAIN: "Prise de masse", MAINTENANCE: "Maintien",
  PERFORMANCE: "Performance", ENDURANCE: "Endurance", HYROX: "Hyrox",
  RUNNING: "Course à pied", FOOTBALL: "Football", MOBILITY: "Mobilité",
};

/** Carte programme — catalogue/templates (Volume 4). Paywall visuel si Premium et non-VIP. */
export function ProgramCard({ program, onPress, isUserPremium = false }: ProgramCardProps): JSX.Element {
  const isLocked = program.isPremium && !isUserPremium;

  return (
    <PressableCard onPress={onPress} padding="none" className="overflow-hidden">
      <View className="h-40 w-full bg-surface">
        {program.coverImageUrl ? (
          <Image source={{ uri: program.coverImageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Flame size={32} color="#767676" />
          </View>
        )}
        {isLocked ? (
          <View className="absolute right-sm top-sm flex-row items-center gap-xxs rounded-full bg-primary px-sm py-xxs">
            <Crown size={12} color="#FFFFFF" />
            <Text className="text-white text-xs font-bold">Premium</Text>
          </View>
        ) : null}
      </View>
      <View className="gap-xs p-md">
        <Text className="text-textPrimary font-semibold" numberOfLines={1}>{program.name}</Text>
        <View className="flex-row gap-xs">
          <Badge label={GOAL_LABEL[program.goalType] ?? program.goalType} variant="primary" />
          <Badge label={`${program.durationWeeks} sem.`} variant="neutral" />
        </View>
      </View>
    </PressableCard>
  );
}
