import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { ApiClientError } from "@fit4u/api-client";
import { useLogin } from "../../services/useAuth";
import { useUiStore } from "../../store/uiStore";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { loginSchema, type LoginFormValues } from "./authSchemas";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props): JSX.Element {
  const login = useLogin();
  const pushToast = useUiStore((s) => s.pushToast);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onError: (error) => {
        const message = error instanceof ApiClientError ? error.message : "Connexion impossible.";
        pushToast({ variant: "error", message });
      },
    });
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-1 justify-center px-xl gap-lg" keyboardShouldPersistTaps="handled">
        <View className="gap-xs">
          <Text className="text-textPrimary text-2xl font-bold">Connexion</Text>
          <Text className="text-textSecondary text-sm">Heureux de te revoir.</Text>
        </View>

        <View className="gap-md">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                label="Mot de passe"
                secureTextEntry
                autoComplete="password"
                error={errors.password?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Pressable onPress={() => navigation.navigate("ForgotPassword")} accessibilityRole="link">
            <Text className="text-primary text-sm self-end">Mot de passe oublié ?</Text>
          </Pressable>
        </View>

        <Button label="Se connecter" size="lg" fullWidth isLoading={login.isPending} onPress={onSubmit} />

        <View className="flex-row justify-center gap-xs">
          <Text className="text-textSecondary text-sm">Pas encore de compte ?</Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text className="text-primary text-sm font-semibold">Créer un compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
