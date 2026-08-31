import { useState } from "react";
import { Pressable, View, type PressableProps, type ViewProps } from "react-native";

export interface CardProps extends ViewProps {
  variant?: "flat" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const VARIANT_CLASSES: Record<NonNullable<CardProps["variant"]>, string> = {
  flat: "bg-surface",
  elevated: "bg-surfaceElevated shadow-lg",
  outlined: "bg-transparent border border-border",
};

const PADDING_CLASSES: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-sm",
  md: "p-lg",
  lg: "p-xl",
};

/** Conteneur de base du design system — support d'ExerciseCard/ProgramCard/etc. */
export function Card({ variant = "flat", padding = "md", className, ...props }: CardProps & { className?: string }): JSX.Element {
  return (
    <View
      className={`rounded-lg ${VARIANT_CLASSES[variant]} ${PADDING_CLASSES[padding]} ${className ?? ""}`}
      {...props}
    />
  );
}

export interface PressableCardProps extends PressableProps {
  variant?: CardProps["variant"];
  padding?: CardProps["padding"];
  className?: string;
}

/** Variante tactile — utilisée par les cartes de contenu (exercice, programme, produit…). */
export function PressableCard({
  variant = "elevated",
  padding = "md",
  className,
  onPressIn,
  onPressOut,
  ...props
}: PressableCardProps): JSX.Element {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      onPressIn={(e) => {
        setIsPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setIsPressed(false);
        onPressOut?.(e);
      }}
      className={`rounded-lg ${VARIANT_CLASSES[variant]} ${PADDING_CLASSES[padding]} ${isPressed ? "opacity-80" : ""} ${className ?? ""}`}
      {...props}
    />
  );
}
