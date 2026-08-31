import { forwardRef, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Champ de saisie du design system — intégré à React Hook Form via `ref`
 * (Volume 4 : "React Hook Form + Zod, tous les formulaires sont validés
 * côté client"). L'état d'erreur change la couleur de bordure et affiche le
 * message sous le champ, jamais une alerte bloquante.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helperText, leftIcon, rightIcon, onFocus, onBlur, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = error ? "border-danger" : isFocused ? "border-primary" : "border-border";

  return (
    <View className="gap-xs">
      {label ? <Text className="text-textSecondary text-sm font-medium">{label}</Text> : null}
      <View className={`flex-row items-center gap-sm rounded-md border bg-surface px-md ${borderClass}`}>
        {leftIcon}
        <TextInput
          ref={ref}
          placeholderTextColor="#767676"
          className="flex-1 py-sm text-textPrimary text-base"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          {...props}
        />
        {rightIcon}
      </View>
      {error ? (
        <Text className="text-danger text-xs">{error}</Text>
      ) : helperText ? (
        <Text className="text-textTertiary text-xs">{helperText}</Text>
      ) : null}
    </View>
  );
});
