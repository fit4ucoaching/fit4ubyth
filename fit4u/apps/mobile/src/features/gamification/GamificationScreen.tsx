import { Award } from "lucide-react-native";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChallengeCard } from "../../components/ChallengeCard/ChallengeCard";
import { CircularProgress } from "../../components/CircularProgress/CircularProgress";
import { Tabs } from "../../components/Tabs/Tabs";
import { useBadges, useChallenges, useCompleteChallenge, useGamificationProfile, useJoinChallenge } from "../../services/useGamification";

const XP_PER_LEVEL = 500;

/** Niveau/XP, badges, défis (Volume 4). */
export function GamificationScreen(): JSX.Element {
  const { data: xp } = useGamificationProfile();
  const { data: badges } = useBadges();
  const { data: challenges } = useChallenges();
  const joinChallenge = useJoinChallenge();
  const completeChallenge = useCompleteChallenge();

  const xpInLevel = xp ? xp.totalXp % XP_PER_LEVEL : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="items-center gap-sm px-lg pt-lg pb-md">
        <CircularProgress value={(xpInLevel / XP_PER_LEVEL) * 100} size={120} label={`Nv. ${xp?.currentLevel ?? 1}`} />
        <Text className="text-textSecondary text-sm">{xpInLevel} / {XP_PER_LEVEL} XP</Text>
      </View>

      <Tabs tabs={[{ key: "challenges", label: "Défis" }, { key: "badges", label: "Badges" }]}>
        {(activeKey) =>
          activeKey === "challenges" ? (
            <FlatList
              data={challenges?.items ?? []}
              keyExtractor={(item) => item.id}
              contentContainerClassName="gap-md px-lg py-md pb-xxl"
              renderItem={({ item }) => (
                <ChallengeCard
                  challenge={item}
                  hasJoined={item.userProgress !== undefined}
                  onJoin={() => joinChallenge.mutate(item.id)}
                  onComplete={() => completeChallenge.mutate(item.id)}
                />
              )}
            />
          ) : (
            <FlatList
              data={badges ?? []}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerClassName="gap-md px-lg py-md pb-xxl"
              columnWrapperClassName="gap-md"
              renderItem={({ item }) => (
                <View className="flex-1 items-center gap-xs rounded-lg bg-surface p-md">
                  <Award size={28} color="#FF6B00" />
                  <Text className="text-textPrimary text-xs text-center font-medium">{item.name}</Text>
                </View>
              )}
            />
          )
        }
      </Tabs>
    </SafeAreaView>
  );
}
