import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { FeedScreen } from "../features/community";
import { ExerciseDetailScreen, ExercisesListScreen } from "../features/exercises";
import { GamificationScreen } from "../features/gamification";
import { ProgressScreen } from "../features/progress";
import { TeddyBubble } from "../features/teddy";
import { MainTabNavigator } from "./MainTabNavigator";
import { ShopNavigator } from "./ShopNavigator";

export type MainStackParamList = {
  Tabs: undefined;
  Exercises: undefined;
  ExerciseDetail: { exerciseId: string };
  Progress: undefined;
  Community: undefined;
  Shop: undefined;
  Gamification: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Racine post-authentification (Volume 4) — enveloppe `MainTabNavigator`
 * (navigation primaire) et expose la "navigation secondaire" (Exercices,
 * Progression, Communauté, Boutique, Gamification) comme écrans-frères
 * accessibles depuis n'importe quel onglet via
 * `navigation.getParent()?.navigate(...)`. La bulle Teddy flottante est
 * montée ici une seule fois, au-dessus de toute la navigation principale.
 */
export function MainNavigator(): JSX.Element {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={MainTabNavigator} />
        <Stack.Screen name="Exercises" component={ExercisesListScreen} options={{ headerShown: true, title: "Exercices" }} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: true, title: "Progression" }} />
        <Stack.Screen name="Community" component={FeedScreen} options={{ headerShown: true, title: "Communauté" }} />
        <Stack.Screen name="Shop" component={ShopNavigator} options={{ headerShown: true, title: "Boutique" }} />
        <Stack.Screen name="Gamification" component={GamificationScreen} options={{ headerShown: true, title: "Défis & Récompenses" }} />
      </Stack.Navigator>
      <TeddyBubble />
    </>
  );
}
