import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Award, ChevronRight, Dumbbell, LogOut, Settings, Trophy } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "../../components/Avatar/Avatar";
import { Badge } from "../../components/Badge/Badge";
import { StatCard } from "../../components/StatCard/StatCard";
import type { ProfileStackParamList } from "../../navigation/ProfileNavigator";
import { useLogout } from "../../services/useAuth";
import { useUserStatistics } from "../../services/useUsers";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileHome">;

const MENU_ITEMS: { label: string; route: keyof ProfileStackParamList; icon: typeof Award }[] = [
  { label: "Badges", route: "Badges" as never, icon: Award },
  { label: "Historique de séances", route: "WorkoutHistory" as never, icon: Dumbbell },
  { label: "Records personnels", route: "PersonalRecords" as never, icon: Trophy },
];

/** Profil (Volume 4) — photo, nom, objectifs, statistiques, badges, historique, paramètres. */
export function ProfileScreen({ navigation }: Props): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const { data: stats } = useUserStatistics();
  const logout = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-lg py-lg gap-lg">
        <View className="items-center gap-sm">
          <Avatar firstName={profile?.firstName} lastName={profile?.lastName} uri={profile?.avatarUrl} size="xl" showVipRing={user?.isPremium} />
          <Text className="text-textPrimary text-xl font-bold">{profile?.firstName} {profile?.lastName}</Text>
          {user?.isPremium ? <Badge label="VIP" variant="vip" /> : null}
        </View>

        <View className="flex-row gap-sm">
          <StatCard icon={Dumbbell} label="Séances" value={String(stats?.completedWorkouts ?? 0)} />
          <StatCard icon={Trophy} label="Records" value={String(stats?.personalRecordsCount ?? 0)} />
        </View>

        <View className="gap-xs">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => navigation.navigate(item.route as never)}
              className="flex-row items-center justify-between rounded-lg bg-surface p-md"
            >
              <View className="flex-row items-center gap-sm">
                <item.icon size={18} color="#B3B3B3" />
                <Text className="text-textPrimary">{item.label}</Text>
              </View>
              <ChevronRight size={18} color="#767676" />
            </Pressable>
          ))}
          <Pressable
            onPress={() => navigation.navigate("Settings" as never)}
            className="flex-row items-center justify-between rounded-lg bg-surface p-md"
          >
            <View className="flex-row items-center gap-sm">
              <Settings size={18} color="#B3B3B3" />
              <Text className="text-textPrimary">Paramètres</Text>
            </View>
            <ChevronRight size={18} color="#767676" />
          </Pressable>
        </View>

        <Pressable onPress={() => logout.mutate()} className="flex-row items-center justify-center gap-sm py-md">
          <LogOut size={18} color="#E74C3C" />
          <Text className="text-danger font-medium">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
