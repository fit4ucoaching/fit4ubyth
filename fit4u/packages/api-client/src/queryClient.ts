import { QueryClient } from "@tanstack/react-query";

import { ApiClientError } from "./ApiClientError";

/**
 * Configuration React Query partagée (Volume 4). `retry` délègue déjà au
 * client HTTP (voir `httpClient.ts`) — React Query ne retente donc que les
 * échecs qui ont épuisé le retry réseau interne, et jamais sur une erreur
 * d'authentification (inutile, déjà gérée par le refresh).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiClientError && error.code === "AUTHENTICATION_ERROR") return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Clés de requête centralisées par domaine — évite les chaînes dupliquées entre hooks. */
export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  users: { me: ["users", "me"] as const, statistics: ["users", "statistics"] as const },
  profiles: {
    preferences: ["profiles", "preferences"] as const,
    privacy: ["profiles", "privacy"] as const,
    notifications: ["profiles", "notifications"] as const,
  },
  exercises: {
    list: (filters?: Record<string, unknown>) => ["exercises", "list", filters] as const,
    detail: (id: string) => ["exercises", "detail", id] as const,
    favorites: ["exercises", "favorites"] as const,
  },
  programs: {
    list: (filters?: Record<string, unknown>) => ["programs", "list", filters] as const,
    detail: (id: string) => ["programs", "detail", id] as const,
  },
  workouts: {
    history: ["workouts", "history"] as const,
    statistics: ["workouts", "statistics"] as const,
    personalRecords: ["workouts", "personal-records"] as const,
  },
  nutrition: {
    foods: (filters?: Record<string, unknown>) => ["nutrition", "foods", filters] as const,
    recipes: ["nutrition", "recipes"] as const,
  },
  progress: {
    history: ["progress", "history"] as const,
    analytics: ["progress", "analytics"] as const,
  },
  gamification: {
    profile: ["gamification", "profile"] as const,
    badges: ["gamification", "badges"] as const,
    challenges: ["gamification", "challenges"] as const,
  },
  community: {
    posts: ["community", "posts"] as const,
    groups: ["community", "groups"] as const,
  },
  shop: {
    products: (filters?: Record<string, unknown>) => ["shop", "products", filters] as const,
    cart: ["shop", "cart"] as const,
    orders: ["shop", "orders"] as const,
  },
  teddy: {
    conversation: (id?: string) => ["teddy", "conversation", id] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    vip: ["admin", "vip"] as const,
    tickets: ["admin", "tickets"] as const,
  },
} as const;
