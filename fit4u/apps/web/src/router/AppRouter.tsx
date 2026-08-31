import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AppLayout } from "../components/layout";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";

/**
 * Routeur principal (Volume 4). Les pages secondaires (Entraînement,
 * Nutrition, Progression, Communauté, Boutique, Défis, Profil, Paramètres,
 * Teddy) suivent exactement le même pattern que `DashboardPage` — ajoutées
 * comme enfants de `ProtectedRoute` au fil des itérations produit.
 */
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: "/", element: <DashboardPage /> }],
      },
    ],
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
