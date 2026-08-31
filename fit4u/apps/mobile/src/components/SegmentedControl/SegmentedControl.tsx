import { Pressable, Text, View } from "react-native";

export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Sélecteur à options exclusives — filtre de difficulté, unité métrique/impérial, période de graphique. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>): JSX.Element {
  return (
    <View className="flex-row rounded-md bg-surface p-xxs" accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`flex-1 items-center rounded-md py-xs ${isActive ? "bg-primary" : ""}`}
          >
            <Text className={`text-sm font-medium ${isActive ? "text-white" : "text-textSecondary"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
