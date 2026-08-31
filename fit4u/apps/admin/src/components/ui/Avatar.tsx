import { cn } from "./utils";

export interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX: Record<NonNullable<AvatarProps["size"]>, number> = { sm: 28, md: 36, lg: 48 };

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

/** Avatar admin — initiales sur fond de marque (pas de photo pour les comptes internes). */
export function Avatar({ firstName, lastName, size = "md", className }: AvatarProps): JSX.Element {
  const px = SIZE_PX[size];
  return (
    <div
      className={cn("flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary", className)}
      style={{ width: px, height: px, fontSize: px * 0.4 }}
      aria-hidden="true"
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
