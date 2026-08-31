import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ExerciseDetailScreen, ExercisesListScreen } from "../features/exercises";

export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
};

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export function ExercisesNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExercisesList" component={ExercisesListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ headerShown: true, title: "" }} />
    </Stack.Navigator>
  );
}
