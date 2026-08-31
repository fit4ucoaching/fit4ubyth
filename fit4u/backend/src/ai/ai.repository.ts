import { BaseRepository } from "../repositories/base.repository";

export class AIRepository extends BaseRepository {
  /**
   * Agrégation des coûts Teddy (Volume 8 §53) — requête SQL brute
   * volontaire : `metadata` est un `Json` (Volume 2), Prisma ne sait pas
   * agréger un chemin JSON via son API typée. Isolée ici plutôt que
   * dispersée, pour qu'une évolution du schéma de `metadata` n'ait qu'un
   * seul endroit à corriger.
   */
  async getTeddyCostSummary(sinceDate: Date) {
    return this.db.$queryRaw<{ total_messages: bigint; total_tokens: bigint; total_cost_micro_usd: bigint }[]>`
      SELECT
        COUNT(*) AS total_messages,
        COALESCE(SUM((metadata->'usage'->>'totalTokens')::bigint), 0) AS total_tokens,
        COALESCE(SUM((metadata->>'estimatedCostMicroUsd')::bigint), 0) AS total_cost_micro_usd
      FROM ai_messages
      WHERE role = 'TEDDY' AND created_at >= ${sinceDate} AND metadata IS NOT NULL
    `;
  }

  createConversation(userId: string, title?: string) {
    return this.db.aIConversation.create({ data: { userId, title } });
  }

  findConversationById(id: string, userId: string) {
    return this.db.aIConversation.findFirst({ where: { id, userId, deletedAt: null } });
  }

  listMessages(conversationId: string) {
    return this.db.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
  }

  addMessage(params: {
    conversationId: string;
    role: "USER" | "TEDDY" | "SYSTEM";
    content: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.db.aIMessage.create({
      data: {
        conversationId: params.conversationId,
        role: params.role,
        content: params.content,
        metadata: params.metadata,
      },
    });
  }

  createWorkoutPlan(params: { userId: string; rationale: string; planData: unknown }) {
    return this.db.aIWorkoutPlan.create({
      data: { userId: params.userId, rationale: params.rationale, planData: params.planData as object, status: "ACTIVE" },
    });
  }

  createNutritionPlan(params: { userId: string; rationale: string; planData: unknown }) {
    return this.db.aINutritionPlan.create({
      data: { userId: params.userId, rationale: params.rationale, planData: params.planData as object, status: "ACTIVE" },
    });
  }

  createProgressReport(params: {
    userId: string;
    periodStart: Date;
    periodEnd: Date;
    summary: string;
    reportData: unknown;
  }) {
    return this.db.aIProgressReport.create({
      data: {
        userId: params.userId,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        summary: params.summary,
        reportData: params.reportData as object,
      },
    });
  }

  createChallenge(params: {
    userId: string;
    title: string;
    description: string;
    targetData: unknown;
    startDate: Date;
    endDate: Date;
  }) {
    return this.db.aIChallenge.create({
      data: {
        userId: params.userId,
        title: params.title,
        description: params.description,
        targetData: params.targetData as object,
        startDate: params.startDate,
        endDate: params.endDate,
        status: "ACTIVE",
      },
    });
  }

  // ── Mémoire long-terme (clé/valeur, voir memory/teddyMemory.service.ts) ──

  getMemory(userId: string, key: string) {
    return this.db.aIMemory.findUnique({ where: { userId_key: { userId, key } } });
  }

  setMemory(userId: string, key: string, value: unknown, expiresAt?: Date) {
    return this.db.aIMemory.upsert({
      where: { userId_key: { userId, key } },
      create: { userId, key, value: value as object, expiresAt },
      update: { value: value as object, expiresAt },
    });
  }

  // ── Lecture cross-domaine pour le contexte Teddy (voir teddyMemory.service.ts) ──
  // Justifié comme pour `users.repository.getStatistics` : agrégation en
  // lecture seule, jamais d'écriture cross-domaine.

  getUserGoals(userId: string) {
    return this.db.goal.findMany({ where: { userId, deletedAt: null, achievedAt: null } });
  }

  getLatestWeight(userId: string) {
    return this.db.weightHistory.findFirst({ where: { userId }, orderBy: { recordedAt: "desc" } });
  }

  getPreferences(userId: string) {
    return this.db.userPreference.findUnique({ where: { userId } });
  }

  getRecentWorkoutSessions(userId: string, take = 10) {
    return this.db.workoutSession.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take,
    });
  }

  getNutritionGoal(userId: string) {
    return this.db.nutritionGoal.findFirst({ where: { userId, deletedAt: null }, orderBy: { effectiveFrom: "desc" } });
  }

  getActiveUserChallenges(userId: string) {
    return this.db.userChallenge.findMany({
      where: { userId, completedAt: null },
      include: { challenge: true },
    });
  }

  /** Données nécessaires au calcul calorique déterministe (voir `@fit4u/teddy-sdk` nutrition/calculations.ts). */
  async getProfileForCalorieCalculation(userId: string) {
    const [profile, latestWeight] = await Promise.all([
      this.db.profile.findUnique({ where: { userId } }),
      this.db.weightHistory.findFirst({ where: { userId }, orderBy: { recordedAt: "desc" } }),
    ]);
    return { profile, weightKg: latestWeight?.weightKg.toNumber() };
  }

  /** Outil `GetShoppingList` — dernière liste de courses non archivée de l'utilisateur. */
  async getShoppingList(userId: string) {
    return this.db.shoppingList.findFirst({
      where: { userId, deletedAt: null },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Records personnels récents — alimente la mémoire évolutive (Volume 5). */
  getRecentPersonalRecords(userId: string, take = 5) {
    return this.db.personalRecord.findMany({
      where: { userId },
      include: { exercise: true },
      take,
      orderBy: { achievedAt: "desc" },
    });
  }

  /** Exercices favoris — alimente la mémoire évolutive (Volume 5). */
  getFavoriteExercises(userId: string, take = 10) {
    return this.db.favoriteExercise.findMany({ where: { userId }, include: { exercise: true }, take });
  }
}
