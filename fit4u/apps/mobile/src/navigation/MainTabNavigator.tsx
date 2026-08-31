import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dumbbell, Home, Salad, Sparkles, User } from "lucide-react-native";

import { DashboardScreen } from "../features/dashboard";
import { NutritionScreen } from "../features/nutrition";
import { TeddyChatScreen } from "../features/teddy";
import { colors } from "@fit4u/ui";
import { ProfileNavigator } from "./ProfileNavigator";
import { WorkoutNavigator } from "./WorkoutNavigator";

export type MainTabParamList = {
  Dashboard: undefined;
  Workout: undefined;
  Teddy: undefined;
  Nutrition: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Bottom Tabs (Volume 4) : Accueil / Entraînement / Teddy / Nutrition / Profil. */
export function MainTabNavigator(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Accueil", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutNavigator}
        options={{ title: "Entraînement", tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Teddy"
        component={TeddyChatScreen}
        options={{ title: "Teddy", tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ title: "Nutrition", tabBarIcon: ({ color, size }) => <Salad color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
