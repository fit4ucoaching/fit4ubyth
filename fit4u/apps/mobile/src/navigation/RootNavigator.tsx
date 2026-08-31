import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@fit4u/ui";
import { useCurrentUser } from "../services/useAuth";
import { useMe } from "../services/useUsers";
import { useAuthStore } from "../store/authStore";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

/**
 * Racine de navigation (Volume 4) — bascule Auth / Onboarding / Main selon
 * l'état d'authentification. Un utilisateur nouvellement inscrit
 * (`Profile.heightCm` etc. non renseignés) passe par l'onboarding ; un
 * utilisateur existant va directement au Dashboard. Cette heuristique
 * simple (présence de `heightCm`) évite d'ajouter un champ
 * `onboardingCompletedAt` dédié au schéma pour ce seul besoin frontend —
 * point d'amélioration futur si le produit l'exige.
 */
export function RootNavigator(): JSX.Element {
  const { isAuthenticated, isHydrating } = useAuthStore();
  const { isLoading: isLoadingSession } = useCurrentUser(isAuthenticated);
  const { data: me, isLoading: isLoadingProfile } = useMe(isAuthenticated);

  if (isHydrating || (isAuthenticated && (isLoadingSession || isLoadingProfile))) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const needsOnboarding = isAuthenticated && me && !me.profile.heightCm;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
