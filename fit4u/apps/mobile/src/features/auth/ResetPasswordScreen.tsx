import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useResetPassword } from "../../services/useAuth";
import { useUiStore } from "../../store/uiStore";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { resetPasswordSchema, type ResetPasswordFormValues } from "./authSchemas";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

/** Atteint via le lien profond envoyé par email (`fit4u://reset-password?token=...`). */
export function ResetPasswordScreen({ navigation, route }: Props): JSX.Element {
  const resetPassword = useResetPassword();
  const pushToast = useUiStore((s) => s.pushToast);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit((values) => {
    resetPassword.mutate(
      { token: route.params.token, password: values.password },
      {
        onSuccess: () => {
          pushToast({ variant: "success", message: "Mot de passe réinitialisé, reconnecte-toi." });
          navigation.navigate("Login");
        },
        onError: () => pushToast({ variant: "error", message: "Lien invalide ou expiré." }),
      },
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-background px-xl justify-center gap-lg">
      <Text className="text-textPrimary text-2xl font-bold">Nouveau mot de passe</Text>
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input label="Nouveau mot de passe" secureTextEntry error={errors.password?.message} value={field.value} onChangeText={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <Input label="Confirmer" secureTextEntry error={errors.confirmPassword?.message} value={field.value} onChangeText={field.onChange} />
        )}
      />
      <Button label="Réinitialiser" fullWidth isLoading={resetPassword.isPending} onPress={onSubmit} />
    </SafeAreaView>
  );
}
