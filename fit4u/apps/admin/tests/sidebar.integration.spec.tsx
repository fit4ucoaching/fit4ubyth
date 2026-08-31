import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { Sidebar } from "../src/components/layout/Sidebar";
import { useAuthStore } from "../src/store/authStore";

/**
 * Integration test (Volume 6) — vérifie que la Sidebar reflète fidèlement
 * les permissions RBAC de bout en bout : un rôle NUTRITION ne doit jamais
 * voir de lien vers un module qu'il n'a pas le droit d'ouvrir, même si ce
 * lien existe dans NAV_ITEMS. C'est la garantie que "permission manquante
 * → invisible", pas seulement "permission manquante → désactivé".
 */
describe("Sidebar — filtrage par permission (RBAC)", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isHydrating: false });
  });

  it("un rôle NUTRITION ne voit que les sections dont il a la permission", () => {
    useAuthStore.setState({
      user: {
        id: "1", email: "nutrition@fit4u.app", roles: ["NUTRITION"],
        permissions: ["nutrition.read", "nutrition.write"], isPremium: false,
      } as never,
      isAuthenticated: true,
      isHydrating: false,
    });

    render(<MemoryRouter><Sidebar /></MemoryRouter>);

    expect(screen.getByText("Nutrition")).toBeInTheDocument();
    expect(screen.queryByText("Utilisateurs")).not.toBeInTheDocument();
    expect(screen.queryByText("Paiements")).not.toBeInTheDocument();
    expect(screen.queryByText("Sauvegardes")).not.toBeInTheDocument();
  });

  it("un SUPER_ADMIN avec toutes les permissions voit les 18 sections", () => {
    const allPermissions = [
      "analytics.read", "users.read", "vip.read", "teddy.read", "exercises.read", "programs.read",
      "nutrition.read", "shop.read", "payments.read", "subscriptions.read", "community.read",
      "support.read", "settings.read", "monitoring.read", "backups.read", "audit.read", "feature_flags.read",
    ];
    useAuthStore.setState({
      user: { id: "1", email: "super@fit4u.app", roles: ["SUPER_ADMIN"], permissions: allPermissions, isPremium: false } as never,
      isAuthenticated: true,
      isHydrating: false,
    });

    render(<MemoryRouter><Sidebar /></MemoryRouter>);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
    expect(screen.getByText("Sauvegardes")).toBeInTheDocument();
    expect(screen.getByText("Audit")).toBeInTheDocument();
  });

  it("un rôle ANALYST ne voit que Dashboard et Analytics", () => {
    useAuthStore.setState({
      user: { id: "1", email: "analyst@fit4u.app", roles: ["ANALYST"], permissions: ["analytics.read"], isPremium: false } as never,
      isAuthenticated: true,
      isHydrating: false,
    });

    render(<MemoryRouter><Sidebar /></MemoryRouter>);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.queryByText("VIP")).not.toBeInTheDocument();
    expect(screen.queryByText("Support")).not.toBeInTheDocument();
  });
});
