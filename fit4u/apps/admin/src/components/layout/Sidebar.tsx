import {
  Activity, Apple, BarChart3, Bot, ClipboardList, CreditCard, Database, DollarSign, Dumbbell,
  LayoutDashboard, LifeBuoy, LogOut, Settings, ShoppingBag, Sparkles, Users, Crown, ListTree,
  ToggleLeft, Users2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { usePermissions } from "../../hooks/usePermissions";
import { useLogout } from "../../services/useAuth";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../ui/utils";

/**
 * 19 sections (Volume 6 : 18 + Teddy CEO ajouté en revue continue) —
 * chacune gardée par une permission (Volume 6 RBAC). Un rôle NUTRITION ne
 * voit ainsi que "Nutrition" (+ ce qui ne nécessite aucune permission
 * spécifique), jamais la totalité du menu avec des liens qui échoueraient
 * au clic.
 */
const NAV_ITEMS: { to: string; label: string; icon: typeof LayoutDashboard; permission?: string }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "analytics.read" },
  { to: "/users", label: "Utilisateurs", icon: Users, permission: "users.read" },
  { to: "/vip", label: "VIP", icon: Crown, permission: "vip.read" },
  { to: "/teddy", label: "Teddy", icon: Sparkles, permission: "teddy.read" },
  { to: "/teddy-ceo", label: "Teddy CEO", icon: Bot, permission: "teddy.read" },
  { to: "/exercises", label: "Exercices", icon: Dumbbell, permission: "exercises.read" },
  { to: "/programs", label: "Programmes", icon: ListTree, permission: "programs.read" },
  { to: "/nutrition", label: "Nutrition", icon: Apple, permission: "nutrition.read" },
  { to: "/shop", label: "Boutique", icon: ShoppingBag, permission: "shop.read" },
  { to: "/payments", label: "Paiements", icon: CreditCard, permission: "payments.read" },
  { to: "/subscriptions", label: "Abonnements", icon: DollarSign, permission: "subscriptions.read" },
  { to: "/community", label: "Communauté", icon: Users2, permission: "community.read" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, permission: "analytics.read" },
  { to: "/support", label: "Support", icon: LifeBuoy, permission: "support.read" },
  { to: "/settings", label: "Paramètres", icon: Settings, permission: "settings.read" },
  { to: "/monitoring", label: "Monitoring", icon: Activity, permission: "monitoring.read" },
  { to: "/backups", label: "Sauvegardes", icon: Database, permission: "backups.read" },
  { to: "/audit", label: "Audit", icon: ClipboardList, permission: "audit.read" },
  { to: "/feature-flags", label: "Feature Flags", icon: ToggleLeft, permission: "feature_flags.read" },
];

export function Sidebar(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { can } = usePermissions();

  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

  return (
    <nav aria-label="Navigation BackOffice" className="flex w-64 shrink-0 flex-col border-r border-border bg-surface p-4">
      <div className="mb-6 px-2">
        <img src="/logo-transparent.png" alt="Fit4U by TH — Admin" className="h-9 w-auto" />
        <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-textTertiary">BackOffice</span>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-textSecondary transition-colors",
                  "hover:bg-surfaceElevated hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive && "bg-primary/10 text-primary",
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-border pt-3">
        <p className="px-2 text-xs font-medium text-textPrimary">{user?.email}</p>
        <button
          onClick={() => logout.mutate()}
          className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-danger hover:bg-surfaceElevated"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
