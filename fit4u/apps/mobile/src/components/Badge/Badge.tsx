import { Text, View } from "react-native";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "vip";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: "bg-primary/15 border-primary",
  success: "bg-success/15 border-success",
  warning: "bg-warning/15 border-warning",
  danger: "bg-danger/15 border-danger",
  neutral: "bg-surfaceElevated border-border",
  vip: "bg-primary border-primary",
};

const TEXT_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-textSecondary",
  vip: "text-white",
};

/** Étiquette compacte — utilisée pour le statut VIP, la difficulté, les catégories. */
export function Badge({ label, variant = "neutral" }: BadgeProps): JSX.Element {
  return (
    <View className={`self-start rounded-full border px-sm py-xxs ${VARIANT_CLASSES[variant]}`}>
      <Text className={`text-xs font-semibold ${TEXT_VARIANT_CLASSES[variant]}`}>{label}</Text>
    </View>
  );
}
