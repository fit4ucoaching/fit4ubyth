import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

/** Garde de route — redirige vers /login si non authentifié (Volume 4). */
export function ProtectedRoute(): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
