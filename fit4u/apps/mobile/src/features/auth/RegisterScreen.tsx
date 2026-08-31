import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiClientError } from "@fit4u/api-client";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useRegister } from "../../services/useAuth";
import { useUiStore } from "../../store/uiStore";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { registerSchema, type RegisterFormValues } from "./authSchemas";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props): JSX.Element {
  const register = useRegister();
  const pushToast = useUiStore((s) => s.pushToast);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    register.mutate(
      { firstName: values.firstName, lastName: values.lastName, email: values.email, password: values.password },
      {
        // La navigation vers l'onboarding se fait automatiquement : dès que
        // `authStore.user` est défini, `RootNavigator` bascule vers
        // `OnboardingNavigator` (nouvel utilisateur détecté).
        onError: (error) => {
          const message = error instanceof ApiClientError ? error.message : "Inscription impossible.";
          pushToast({ variant: "error", message });
        },
      },
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-xl gap-lg py-xl" keyboardShouldPersistTaps="handled">
        <View className="gap-xs">
          <Text className="text-textPrimary text-2xl font-bold">Créer un compte</Text>
          <Text className="text-textSecondary text-sm">Rejoins Fit4U et rencontre Teddy.</Text>
        </View>

        <View className="gap-md">
          <View className="flex-row gap-sm">
            <View className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <Input label="Prénom" error={errors.firstName?.message} value={field.value} onChangeText={field.onChange} />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <Input label="Nom" error={errors.lastName?.message} value={field.value} onChangeText={field.onChange} />
                )}
              />
            </View>
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
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                label="Mot de passe"
                secureTextEntry
                helperText="8 caractères min., 1 majuscule, 1 chiffre"
                error={errors.password?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Input
                label="Confirmer le mot de passe"
                secureTextEntry
                error={errors.confirmPassword?.message}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
        </View>

        <Button label="Créer mon compte" size="lg" fullWidth isLoading={register.isPending} onPress={onSubmit} />

        <View className="flex-row justify-center gap-xs">
          <Text className="text-textSecondary text-sm">Déjà inscrit ?</Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text className="text-primary text-sm font-semibold">Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
