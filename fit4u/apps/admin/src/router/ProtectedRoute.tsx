import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

/** Garde d'authentification + rôle (Volume 4) — le contrôle strict reste côté serveur (Volume 3). */
export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.roles.some((r) => r === "ADMIN" || r === "SUPER_ADMIN") ?? false;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return <Outlet />;
}
