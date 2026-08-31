import type { ChallengeDTO } from "@fit4u/types";
import { Trophy } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { Progress } from "../Progress/Progress";

export interface ChallengeCardProps {
  challenge: ChallengeDTO;
  onJoin?: () => void;
  onComplete?: () => void;
  hasJoined?: boolean;
}

/** Carte défi — gamification (Volume 4). */
export function ChallengeCard({ challenge, onJoin, onComplete, hasJoined = false }: ChallengeCardProps): JSX.Element {
  const isCompleted = Boolean(challenge.userCompletedAt);

  return (
    <Card variant="elevated" padding="lg" className="gap-md">
      <View className="flex-row items-center gap-sm">
        <Trophy size={20} color="#FF6B00" />
        <Text className="flex-1 text-textPrimary font-semibold">{challenge.title}</Text>
        <Text className="text-primary text-xs font-bold">+{challenge.xpReward} XP</Text>
      </View>
      {challenge.description ? (
        <Text className="text-textSecondary text-sm">{challenge.description}</Text>
      ) : null}
      {hasJoined ? <Progress value={challenge.userProgress ?? 0} /> : null}
      {!hasJoined && onJoin ? (
        <Button label="Rejoindre" variant="outline" size="sm" onPress={onJoin} />
      ) : null}
      {hasJoined && !isCompleted && onComplete ? (
        <Button label="Marquer comme terminé" variant="primary" size="sm" onPress={onComplete} />
      ) : null}
      {isCompleted ? <Text className="text-success text-sm font-semibold">✓ Défi complété</Text> : null}
    </Card>
  );
}
