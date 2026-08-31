import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { Platform, View } from "react-native";

import { ApiClientError } from "@fit4u/api-client";
import { Button } from "../../components/Button/Button";
import { useAppleAuth, useGoogleAuth } from "../../services/useAuth";
import { useUiStore } from "../../store/uiStore";

/**
 * Boutons de connexion sociale (Volume 4 : "Google Login / Apple Login").
 * Ce ne sont volontairement PAS des écrans séparés : le flux OAuth natif
 * (Expo AuthSession / Sign in with Apple) s'exécute en overlay système,
 * puis retourne directement le jeton au hook `useGoogleAuth`/`useAppleAuth`
 * — cohérent avec l'UX standard de ces providers sur mobile.
 */
export function SocialAuthButtons(): JSX.Element {
  const pushToast = useUiStore((s) => s.pushToast);
  const googleAuth = useGoogleAuth();
  const appleAuth = useAppleAuth();

  const [, googleResponse, promptGoogleAuth] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ scheme: "fit4u" }),
  });

  useEffect(() => {
    if (googleResponse?.type === "success" && googleResponse.params.id_token) {
      googleAuth.mutate(googleResponse.params.id_token, {
        onError: () => pushToast({ variant: "error", message: "Connexion Google impossible." }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleResponse]);

  const handleAppleSignIn = async (): Promise<void> => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("Jeton Apple manquant.");

      appleAuth.mutate(
        {
          identityToken: credential.identityToken,
          firstName: credential.fullName?.givenName ?? undefined,
          lastName: credential.fullName?.familyName ?? undefined,
        },
        { onError: () => pushToast({ variant: "error", message: "Connexion Apple impossible." }) },
      );
    } catch (err) {
      if (err instanceof ApiClientError || (err as { code?: string }).code !== "ERR_REQUEST_CANCELED") {
        pushToast({ variant: "error", message: "Connexion Apple impossible." });
      }
    }
  };

  return (
    <View className="gap-sm">
      <Button
        label="Continuer avec Google"
        variant="secondary"
        fullWidth
        isLoading={googleAuth.isPending}
        onPress={() => void promptGoogleAuth()}
      />
      {Platform.OS === "ios" ? (
        <Button
          label="Continuer avec Apple"
          variant="secondary"
          fullWidth
          isLoading={appleAuth.isPending}
          onPress={() => void handleAppleSignIn()}
        />
      ) : null}
    </View>
  );
}
