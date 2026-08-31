import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useForgotPassword } from "../../services/useAuth";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "./authSchemas";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props): JSX.Element {
  const forgotPassword = useForgotPassword();
  const [isSent, setIsSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit((values) => {
    forgotPassword.mutate(values.email, { onSuccess: () => setIsSent(true) });
  });

  if (isSent) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-xl gap-lg">
        <Text className="text-textPrimary text-xl font-bold text-center">Email envoyé</Text>
        <Text className="text-textSecondary text-sm text-center">
          Si un compte existe avec cette adresse, tu recevras un lien de réinitialisation.
        </Text>
        <Button label="Retour à la connexion" onPress={() => navigation.navigate("Login")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-xl justify-center gap-lg">
      <View className="gap-xs">
        <Text className="text-textPrimary text-2xl font-bold">Mot de passe oublié</Text>
        <Text className="text-textSecondary text-sm">On t'envoie un lien de réinitialisation.</Text>
      </View>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      <Button label="Envoyer le lien" fullWidth isLoading={forgotPassword.isPending} onPress={onSubmit} />
    </SafeAreaView>
  );
}
