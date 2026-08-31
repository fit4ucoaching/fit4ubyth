import { zodResolver } from "@hookform/resolvers/zod";
import { ApiClientError } from "@fit4u/api-client";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button, Input } from "../components/ui";
import { useLogin } from "../services/useAuth";
import { useUiStore } from "../store/uiStore";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

/** Connexion BackOffice — accès réservé aux rôles ADMIN/SUPER_ADMIN (contrôle serveur, Volume 3). */
export function LoginPage(): JSX.Element {
  const login = useLogin();
  const navigate = useNavigate();
  const pushToast = useUiStore((s) => s.pushToast);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (result) => {
        if (!result.user.roles.some((r) => r === "ADMIN" || r === "SUPER_ADMIN")) {
          pushToast({ variant: "error", message: "Ce compte n'a pas accès au BackOffice." });
          return;
        }
        navigate("/");
      },
      onError: (error) => {
        const message = error instanceof ApiClientError ? error.message : "Connexion impossible.";
        pushToast({ variant: "error", message });
      },
    });
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-textPrimary">Fit4U <span className="text-primary">Admin</span></h1>
          <p className="text-sm text-textSecondary">Accès réservé à l'équipe Fit4U.</p>
        </div>
        <div className="space-y-4">
          <Controller control={control} name="email" render={({ field }) => (
            <Input label="Email" type="email" error={errors.email?.message} {...field} />
          )} />
          <Controller control={control} name="password" render={({ field }) => (
            <Input label="Mot de passe" type="password" error={errors.password?.message} {...field} />
          )} />
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={login.isPending}>
          Se connecter
        </Button>
      </form>
    </div>
  );
}
