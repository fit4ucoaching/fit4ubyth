import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Sheet } from "../Modal/Sheet";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  label?: string;
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
}

/** Sélecteur à choix unique — s'ouvre en bottom sheet (cohérent avec l'UX mobile native). */
export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
}: SelectProps<T>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <View className="gap-xs">
      {label ? <Text className="text-textSecondary text-sm font-medium">{label}</Text> : null}
      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="flex-row items-center justify-between rounded-md border border-border bg-surface px-md py-sm"
      >
        <Text className={selectedLabel ? "text-textPrimary" : "text-textTertiary"}>
          {selectedLabel ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#767676" />
      </Pressable>

      <Sheet visible={isOpen} onClose={() => setIsOpen(false)}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className="flex-row items-center justify-between py-md"
            accessibilityRole="menuitem"
          >
            <Text className="text-textPrimary text-base">{option.label}</Text>
            {option.value === value ? <Check size={18} color="#FF6B00" /> : null}
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}
