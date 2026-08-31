import { Image } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoTransparent = require("../../../assets/logo-transparent.png") as number;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoSolid = require("../../../assets/logo.png") as number;

export interface LogoProps {
  /** "transparent" pour fond sombre (header/nav/dashboard) — "solid" pour documents/impression. */
  variant?: "transparent" | "solid";
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Logo officiel Fit4U by TH (asset fourni par le propriétaire du projet —
 * voir /assets/branding). Composant unique utilisé partout dans l'app :
 * jamais de logo recréé ou redessiné ailleurs dans le code.
 */
export function Logo({ variant = "transparent", size = 40, style }: LogoProps): JSX.Element {
  return (
    <Image
      source={variant === "transparent" ? logoTransparent : logoSolid}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      accessibilityLabel="Fit4U by TH"
    />
  );
}
