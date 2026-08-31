import { Image } from "expo-image";
import { Text, View } from "react-native";

export interface AvatarProps {
  uri?: string;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showVipRing?: boolean;
}

const SIZE_PX: Record<NonNullable<AvatarProps["size"]>, number> = { sm: 32, md: 44, lg: 64, xl: 96 };

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

/** Avatar utilisateur — anneau doré si VIP (Volume 4 : "Afficher le badge VIP"). */
export function Avatar({ uri, firstName, lastName, size = "md", showVipRing = false }: AvatarProps): JSX.Element {
  const px = SIZE_PX[size];
  const ringClass = showVipRing ? "border-2 border-primary" : "";

  return (
    <View
      className={`items-center justify-center rounded-full bg-surfaceElevated ${ringClass}`}
      style={{ width: px, height: px }}
      accessibilityLabel={`Avatar de ${firstName ?? "utilisateur"}`}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: px, height: px, borderRadius: px / 2 }} contentFit="cover" />
      ) : (
        <Text className="text-textPrimary font-semibold" style={{ fontSize: px * 0.36 }}>
          {getInitials(firstName, lastName)}
        </Text>
      )}
    </View>
  );
}
