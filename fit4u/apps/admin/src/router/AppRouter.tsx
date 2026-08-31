import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AppLayout } from "../components/layout";
import {
  AnalyticsPage, AuditLogsPage, BackupsPage, CommunityPage, DashboardPage, ExercisesPage, FeatureFlagsPage,
  LoginPage, MonitoringPage, NutritionPage, PaymentsPage, ProgramsPage, SettingsPage,
  ShopPage, SubscriptionsPage, SupportPage, TeddyCeoPage, TeddyControlCenterPage,
  UserDetailPage, UsersPage, VipPage,
} from "../pages";
import { ProtectedRoute } from "./ProtectedRoute";

/**
 * Routeur BackOffice (19 sections) — après six tours de revue continue
 * post-Volume 8, les 19 sections sont toutes connectées à un vrai
 * endpoint. `ComingSoonPage` (composant conservé) n'est plus référencé ici
 * mais reste disponible pour un futur module encore non construit.
 */
const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/users", element: <UsersPage /> },
          { path: "/users/:id", element: <UserDetailPage /> },
          { path: "/vip", element: <VipPage /> },
          { path: "/teddy", element: <TeddyControlCenterPage /> },
          { path: "/teddy-ceo", element: <TeddyCeoPage /> },
          { path: "/exercises", element: <ExercisesPage /> },
          { path: "/programs", element: <ProgramsPage /> },
          { path: "/nutrition", element: <NutritionPage /> },
          { path: "/shop", element: <ShopPage /> },
          { path: "/payments", element: <PaymentsPage /> },
          { path: "/subscriptions", element: <SubscriptionsPage /> },
          { path: "/community", element: <CommunityPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/support", element: <SupportPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/monitoring", element: <MonitoringPage /> },
          { path: "/backups", element: <BackupsPage /> },
          { path: "/audit", element: <AuditLogsPage /> },
          { path: "/feature-flags", element: <FeatureFlagsPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
