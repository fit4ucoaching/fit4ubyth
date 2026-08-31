import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useUpdateProfile } from "../../services/useUsers";
import { useUiStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";

const accountSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  bio: z.string().max(280).optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

/** Section "Compte" des paramètres (Volume 4) — nom, bio ; le changement de mot de passe passe par le flux "Mot de passe oublié" pour rester cohérent avec la révocation de sessions côté backend. */
export function AccountSection(): JSX.Element {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUpdateProfile();
  const pushToast = useUiStore((s) => s.pushToast);

  const { control, handleSubmit } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { firstName: profile?.firstName ?? "", lastName: profile?.lastName ?? "", bio: profile?.bio ?? "" },
  });

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values, {
      onSuccess: () => pushToast({ variant: "success", message: "Profil mis à jour." }),
    });
  });

  return (
    <View className="gap-sm">
      <Text className="text-textSecondary text-xs uppercase font-semibold">Compte</Text>
      <Controller control={control} name="firstName" render={({ field }) => (
        <Input label="Prénom" value={field.value} onChangeText={field.onChange} />
      )} />
      <Controller control={control} name="lastName" render={({ field }) => (
        <Input label="Nom" value={field.value} onChangeText={field.onChange} />
      )} />
      <Button label="Enregistrer" variant="outline" isLoading={updateProfile.isPending} onPress={onSubmit} />
    </View>
  );
}
