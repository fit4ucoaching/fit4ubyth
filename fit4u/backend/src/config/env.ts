import "dotenv/config";

import { z } from "zod";

/**
 * Schéma strict des variables d'environnement — toute variable critique
 * manquante ou invalide fait échouer le démarrage immédiatement (fail-fast)
 * plutôt que de provoquer un comportement indéfini en production.
 *
 * Convention : les secrets n'ont AUCUNE valeur par défaut. Les paramètres
 * non sensibles (port, TTL…) ont des défauts raisonnables pour le
 * développement local uniquement.
 */
const envSchema = z.object({
  // ── Runtime ──
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_VERSION: z.string().default("v1"),
  APP_URL: z.string().url().default("http://localhost:4000"),
  WEB_APP_URL: z.string().url().default("http://localhost:5173"),
  ADMIN_APP_URL: z.string().url().default("http://localhost:5174"),

  // ── Base de données ──
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  // ── Redis (sessions, cache, rate limiting, BullMQ, classements) ──
  REDIS_URL: z.string().min(1, "REDIS_URL est requis"),

  // ── Auth JWT ──
  JWT_SECRET: z.string().min(32, "JWT_SECRET doit contenir au moins 32 caractères"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET doit contenir au moins 32 caractères"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // ── OAuth ──
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID est requis"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET est requis"),
  APPLE_CLIENT_ID: z.string().min(1, "APPLE_CLIENT_ID est requis"),
  APPLE_TEAM_ID: z.string().min(1, "APPLE_TEAM_ID est requis"),
  APPLE_KEY_ID: z.string().min(1, "APPLE_KEY_ID est requis"),
  APPLE_PRIVATE_KEY: z.string().min(1, "APPLE_PRIVATE_KEY est requis"),

  // ── Paiements ──
  STRIPE_SECRET: z.string().min(1, "STRIPE_SECRET est requis"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET est requis"),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),

  // ── Boutique ──
  SHOPIFY_STORE_DOMAIN: z.string().min(1, "SHOPIFY_STORE_DOMAIN est requis"),
  SHOPIFY_TOKEN: z.string().min(1, "SHOPIFY_TOKEN est requis"),
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),

  // ── Teddy AI ──
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY est requis"),

  // ── Email (vérification, reset password) ──
  EMAIL_FROM: z.string().email().default("no-reply@fit4u.app"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST est requis"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1, "SMTP_USER est requis"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD est requis"),

  // ── Rate limiting / sécurité ──
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  BRUTE_FORCE_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  BRUTE_FORCE_BLOCK_DURATION_S: z.coerce.number().int().positive().default(15 * 60),

  // ── Observabilité ──
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Variables requises uniquement en production — permet de lancer le backend
 * en local/CI sans configurer l'intégralité des secrets tiers (Stripe,
 * Shopify, OpenAI…), tout en garantissant qu'aucun déploiement en
 * production ne démarre avec un secret manquant.
 */
const PRODUCTION_ONLY_REQUIRED: (keyof Env)[] = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "APPLE_CLIENT_ID",
  "APPLE_TEAM_ID",
  "APPLE_KEY_ID",
  "APPLE_PRIVATE_KEY",
  "STRIPE_SECRET",
  "STRIPE_WEBHOOK_SECRET",
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_TOKEN",
  "OPENAI_API_KEY",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASSWORD",
];

function loadEnv(): Env {
  // En développement/test, les secrets tiers reçoivent une valeur factice
  // s'ils sont absents, pour ne pas bloquer le démarrage local — mais JAMAIS
  // en production (voir validation stricte ci-dessous).
  const isProduction = process.env.NODE_ENV === "production";
  const source = { ...process.env };

  if (!isProduction) {
    for (const key of PRODUCTION_ONLY_REQUIRED) {
      if (!source[key]) {
        source[key] = `dev-placeholder-${key.toLowerCase()}`;
      }
    }
  }

  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("❌ Configuration invalide — variables d'environnement manquantes ou invalides :");
    for (const issue of parsed.error.issues) {
      // eslint-disable-next-line no-console
      console.error(`   • ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (isProduction) {
    const missing = PRODUCTION_ONLY_REQUIRED.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      // eslint-disable-next-line no-console
      console.error(`❌ Variables requises en production manquantes : ${missing.join(", ")}`);
      process.exit(1);
    }
  }

  return parsed.data;
}

export const env: Env = loadEnv();
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
