import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingProvider } from "../features/onboarding/OnboardingContext";
import {
  CompleteStep,
  DietaryPreferencesStep,
  EquipmentStep,
  FrequencyStep,
  GoalStep,
  HeightStep,
  LevelStep,
  NotificationsStep,
  TeddyIntroStep,
  WeightStep,
  WelcomeStep,
} from "../features/onboarding/steps";

export type OnboardingStackParamList = {
  Welcome: undefined;
  Goal: undefined;
  Level: undefined;
  Equipment: undefined;
  Frequency: undefined;
  Weight: undefined;
  Height: undefined;
  DietaryPreferences: undefined;
  TeddyIntro: undefined;
  Notifications: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * Onboarding intelligent (Volume 4) — 11 étapes (dont Bienvenue), state
 * partagé via `OnboardingProvider` pour que chaque étape lise/écrive le
 * même brouillon sans prop-drilling ni store global prématuré.
 */
export function OnboardingNavigator(): JSX.Element {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
        <Stack.Screen name="Welcome" component={WelcomeStep} />
        <Stack.Screen name="Goal" component={GoalStep} />
        <Stack.Screen name="Level" component={LevelStep} />
        <Stack.Screen name="Equipment" component={EquipmentStep} />
        <Stack.Screen name="Frequency" component={FrequencyStep} />
        <Stack.Screen name="Weight" component={WeightStep} />
        <Stack.Screen name="Height" component={HeightStep} />
        <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesStep} />
        <Stack.Screen name="TeddyIntro" component={TeddyIntroStep} />
        <Stack.Screen name="Notifications" component={NotificationsStep} />
        <Stack.Screen name="Complete" component={CompleteStep} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
