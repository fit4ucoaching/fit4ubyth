import {
  Dumbbell, Home, LogOut, Salad, Settings, ShoppingBag, Sparkles, TrendingUp, Trophy, User, Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useLogout } from "../../services/useAuth";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../ui";

const NAV_ITEMS = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/workout", label: "Entraînement", icon: Dumbbell },
  { to: "/teddy", label: "Teddy", icon: Sparkles },
  { to: "/nutrition", label: "Nutrition", icon: Salad },
  { to: "/progress", label: "Progression", icon: TrendingUp },
  { to: "/community", label: "Communauté", icon: Users },
  { to: "/shop", label: "Boutique", icon: ShoppingBag },
  { to: "/gamification", label: "Défis", icon: Trophy },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/settings", label: "Paramètres", icon: Settings },
];

/**
 * Sidebar permanente (Volume 4 : "Web — Sidebar permanente. Responsive.
 * Navigation clavier"). `NavLink` gère nativement le focus clavier
 * (Tab/Entrée) ; `aria-current` posé automatiquement par React Router sur
 * le lien actif pour les lecteurs d'écran.
 */
export function Sidebar(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex"
    >
      <div className="mb-8 px-2">
        <img src="/logo-transparent.png" alt="Fit4U by TH" className="h-10 w-auto" />
      </div>

      <ul className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-textSecondary transition-colors",
                  "hover:bg-surfaceElevated hover:text-textPrimary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive && "bg-primary/10 text-primary",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-border pt-4">
        <p className="px-2 text-sm font-medium text-textPrimary">{user?.firstName} {user?.lastName}</p>
        <button
          onClick={() => logout.mutate()}
          className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-danger hover:bg-surfaceElevated"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </nav>
  );
}
