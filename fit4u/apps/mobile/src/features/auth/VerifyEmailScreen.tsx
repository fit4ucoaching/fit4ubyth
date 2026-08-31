import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { useVerifyEmail } from "../../services/useAuth";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

/** Atteint via le lien profond envoyé par email (`fit4u://verify-email?token=...`). */
export function VerifyEmailScreen({ navigation, route }: Props): JSX.Element {
  const verifyEmail = useVerifyEmail();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    verifyEmail.mutate(route.params.token, {
      onSuccess: () => setStatus("success"),
      onError: () => setStatus("error"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.token]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background px-xl gap-lg">
      {status === "pending" ? <ActivityIndicator color="#FF6B00" /> : null}
      {status === "success" ? (
        <>
          <Text className="text-textPrimary text-xl font-bold text-center">Email vérifié ✓</Text>
          <Button label="Continuer" onPress={() => navigation.navigate("Login")} />
        </>
      ) : null}
      {status === "error" ? (
        <Text className="text-danger text-base text-center">Lien invalide ou expiré.</Text>
      ) : null}
    </SafeAreaView>
  );
}
