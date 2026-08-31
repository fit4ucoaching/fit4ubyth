import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { usePermissions } from "../src/hooks/usePermissions";
import { useAuthStore } from "../src/store/authStore";

/**
 * Permission tests (Volume 6) — vérifie que `usePermissions()` reflète
 * exactement les permissions du token, sans logique d'inférence côté
 * client (le rôle n'est jamais réinterprété en frontend, seules les
 * permissions embarquées dans le JWT comptent).
 */
describe("usePermissions", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isHydrating: false });
  });

  it("ne rend aucune permission accessible sans utilisateur connecté", () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can("users.read")).toBe(false);
    expect(result.current.permissions).toEqual([]);
  });

  it("can() reflète exactement les permissions du store", () => {
    useAuthStore.setState({
      user: { id: "1", email: "a@a.com", roles: ["SUPPORT"], permissions: ["users.read", "support.write"], isPremium: false } as never,
      isAuthenticated: true,
      isHydrating: false,
    });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.can("users.read")).toBe(true);
    expect(result.current.can("users.delete")).toBe(false);
  });

  it("canAny() renvoie true si au moins une permission correspond", () => {
    useAuthStore.setState({
      user: { id: "1", email: "a@a.com", roles: ["ANALYST"], permissions: ["analytics.read"], isPremium: false } as never,
      isAuthenticated: true,
      isHydrating: false,
    });
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAny("users.read", "analytics.read")).toBe(true);
    expect(result.current.canAny("users.read", "vip.write")).toBe(false);
  });

  it("un SUPER_ADMIN avec toutes les permissions embarquées peut tout faire", () => {
    const allPerms = ["users.read", "users.write", "vip.write", "payments.refund", "audit.read"];
    useAuthStore.setState({
      user: { id: "1", email: "a@a.com", roles: ["SUPER_ADMIN"], permissions: allPerms, isPremium: false } as never,
      isAuthenticated: true,
      isHydrating: false,
    });
    const { result } = renderHook(() => usePermissions());
    for (const perm of allPerms) {
      expect(result.current.can(perm)).toBe(true);
    }
  });
});
