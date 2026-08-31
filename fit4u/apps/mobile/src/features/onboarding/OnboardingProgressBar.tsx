import { View } from "react-native";

import { Progress } from "../../components/Progress/Progress";

export function OnboardingProgressBar({ step, totalSteps }: { step: number; totalSteps: number }): JSX.Element {
  return (
    <View className="px-xl pt-sm">
      <Progress value={(step / totalSteps) * 100} />
    </View>
  );
}
