import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  ProgramDetailScreen,
  ProgramsListScreen,
  ReplaceExerciseScreen,
  WorkoutSessionScreen,
  WorkoutSummaryScreen,
} from "../features/workout";

export type WorkoutStackParamList = {
  ProgramsList: undefined;
  ProgramDetail: { programId: string };
  WorkoutSession: undefined;
  ReplaceExercise: undefined;
  WorkoutSummary: { durationSeconds: number; caloriesBurned: number; exerciseCount: number };
};

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

/** Pile "WORKOUT FLOW" (Volume 4) — accessible depuis l'onglet Entraînement et le Dashboard. */
export function WorkoutNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProgramsList" component={ProgramsListScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ReplaceExercise" component={ReplaceExerciseScreen} options={{ presentation: "modal" }} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
