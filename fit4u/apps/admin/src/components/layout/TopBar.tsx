import { Bell, Search } from "lucide-react";

import { Badge } from "../ui";
import { useAuthStore } from "../../store/authStore";

/**
 * TopBar (Volume 6 : "TopBar → Sidebar → Content → RightPanel"). Recherche
 * globale + notifications + rôle courant affiché — la Sidebar reste seule
 * responsable de la navigation entre modules.
 */
export function TopBar(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const primaryRole = user?.roles.find((r) => r !== "USER") ?? "ADMIN";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" size={16} />
        <input
          placeholder="Rechercher un utilisateur, une commande, un ticket…"
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Recherche globale"
        />
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="primary">{primaryRole}</Badge>
        <button aria-label="Notifications" className="rounded-md p-2 text-textSecondary hover:bg-surfaceElevated">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
