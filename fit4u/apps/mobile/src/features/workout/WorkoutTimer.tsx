import { Text, View } from "react-native";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Grand chronomètre plein écran (Volume 4 : "pendant une séance : grand chronomètre"). */
export function WorkoutTimer({ seconds, label }: { seconds: number; label: string }): JSX.Element {
  return (
    <View className="items-center gap-xs">
      <Text className="text-textSecondary text-xs uppercase font-semibold">{label}</Text>
      <Text className="text-textPrimary text-6xl font-bold tabular-nums">{formatDuration(seconds)}</Text>
    </View>
  );
}
