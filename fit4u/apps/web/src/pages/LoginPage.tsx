import { zodResolver } from "@hookform/resolvers/zod";
import { ApiClientError } from "@fit4u/api-client";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button, Input } from "../components/ui";
import { loginSchema, type LoginFormValues } from "../features/auth/authSchemas";
import { useLogin } from "../services/useAuth";
import { useUiStore } from "../store/uiStore";

/** Page de connexion (Volume 4) — miroir web de `LoginScreen` mobile. */
export function LoginPage(): JSX.Element {
  const login = useLogin();
  const navigate = useNavigate();
  const pushToast = useUiStore((s) => s.pushToast);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => navigate("/"),
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
          <h1 className="text-2xl font-bold text-textPrimary">Fit4U by TH</h1>
          <p className="text-sm text-textSecondary">Connecte-toi pour retrouver Teddy.</p>
        </div>

        <div className="space-y-4">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...field} />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input label="Mot de passe" type="password" autoComplete="current-password" error={errors.password?.message} {...field} />
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={login.isPending}>
          Se connecter
        </Button>

        <p className="text-center text-sm text-textSecondary">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-primary">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
