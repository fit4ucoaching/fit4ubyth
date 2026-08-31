import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BadgesScreen, PersonalRecordsScreen, ProfileScreen, WorkoutHistoryScreen } from "../features/profile";
import { SettingsScreen } from "../features/settings";
import { PremiumScreen } from "../features/premium";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Badges: undefined;
  WorkoutHistory: undefined;
  PersonalRecords: undefined;
  Settings: undefined;
  Premium: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/** Pile Profil (Volume 4) — inclut aussi Paramètres et Premium, accessibles depuis le Profil. */
export function ProfileNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} options={{ headerShown: true, title: "Badges" }} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ headerShown: true, title: "Historique" }} />
      <Stack.Screen name="PersonalRecords" component={PersonalRecordsScreen} options={{ headerShown: true, title: "Records" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: true, title: "" }} />
    </Stack.Navigator>
  );
}
