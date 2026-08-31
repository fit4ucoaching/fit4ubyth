import { zodResolver } from "@hookform/resolvers/zod";
import { ApiClientError } from "@fit4u/api-client";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button, Input } from "../components/ui";
import { registerSchema, type RegisterFormValues } from "../features/auth/authSchemas";
import { useRegister } from "../services/useAuth";
import { useUiStore } from "../store/uiStore";

export function RegisterPage(): JSX.Element {
  const register = useRegister();
  const navigate = useNavigate();
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
        onSuccess: () => navigate("/"),
        onError: (error) => {
          const message = error instanceof ApiClientError ? error.message : "Inscription impossible.";
          pushToast({ variant: "error", message });
        },
      },
    );
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-textPrimary">Créer un compte</h1>
          <p className="text-sm text-textSecondary">Rejoins Fit4U et rencontre Teddy.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Controller control={control} name="firstName" render={({ field }) => (
              <Input label="Prénom" error={errors.firstName?.message} {...field} />
            )} />
            <Controller control={control} name="lastName" render={({ field }) => (
              <Input label="Nom" error={errors.lastName?.message} {...field} />
            )} />
          </div>
          <Controller control={control} name="email" render={({ field }) => (
            <Input label="Email" type="email" error={errors.email?.message} {...field} />
          )} />
          <Controller control={control} name="password" render={({ field }) => (
            <Input label="Mot de passe" type="password" helperText="8 caractères min., 1 majuscule, 1 chiffre" error={errors.password?.message} {...field} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field }) => (
            <Input label="Confirmer" type="password" error={errors.confirmPassword?.message} {...field} />
          )} />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={register.isPending}>
          Créer mon compte
        </Button>

        <p className="text-center text-sm text-textSecondary">
          Déjà inscrit ? <Link to="/login" className="font-semibold text-primary">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
