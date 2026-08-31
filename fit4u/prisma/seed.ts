import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed de référence (Volume 8 — reproductibilité) : données de
 * configuration nécessaires au fonctionnement du système
 * d'Entitlements/Feature Flags, jamais des données utilisateur de test.
 * `upsert` partout — exécutable plusieurs fois sans effet de bord
 * (idempotent, cohérent avec le reste du projet — Volume 7 §16).
 */
async function main(): Promise<void> {
  // FeatureDefinition — fonctionnalités Premium citées explicitement au Volume 7 §6.
  const features = [
    { key: "nutrition.advanced_ai", description: "Génération de plans nutritionnels avancés par Teddy", minimumLevel: "PREMIUM" },
    { key: "teddy.voice", description: "Interface vocale Teddy", minimumLevel: "PREMIUM" },
    { key: "teddy.vision", description: "Analyse de posture par Teddy Vision", minimumLevel: "PREMIUM" },
    { key: "programs.premium_catalog", description: "Programmes d'entraînement Premium", minimumLevel: "PREMIUM" },
    { key: "analytics.advanced", description: "Statistiques avancées de progression", minimumLevel: "PREMIUM" },
  ];
  for (const feature of features) {
    await prisma.featureDefinition.upsert({
      where: { key: feature.key },
      create: { ...feature, isActive: true },
      update: { description: feature.description, minimumLevel: feature.minimumLevel },
    });
  }

  // Feature Flags nommés (Volume 8 §55) — désactivés par défaut, activation explicite via BackOffice.
  const flags = ["TEDDY_VOICE", "TEDDY_VISION", "NEW_DASHBOARD", "SHOPIFY_V2", "AI_ANALYTICS"];
  for (const key of flags) {
    await prisma.featureFlag.upsert({
      where: { key },
      create: { key, isEnabled: false, rolloutPercentage: 0, targetAudience: "ALL", isBeta: true },
      update: {},
    });
  }

  console.log(`Seed terminé : ${features.length} FeatureDefinition, ${flags.length} FeatureFlag.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
