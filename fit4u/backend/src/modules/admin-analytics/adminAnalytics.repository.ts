import { BaseRepository } from "../../repositories/base.repository";

/**
 * Analytics BI (BackOffice) — décision d'architecture (comparaison avec
 * Stripe Dashboard/Shopify Admin/Linear/Vercel) : un jeu de graphiques
 * CURÉS et pertinents, jamais un constructeur de requêtes générique
 * auto-service. Chaque méthode répond à UNE question métier précise,
 * jamais un filtre multi-dimensionnel arbitraire — cohérent avec la mise
 * en garde du Volume 8 §22 contre la sur-ingénierie d'infrastructure non
 * justifiée par un besoin réel.
 */
export class AdminAnalyticsRepository extends BaseRepository {
  /** Nouveaux utilisateurs par jour — série temporelle pour un graphique de croissance. */
  async getUserGrowthTrend(days: number) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    return this.db.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', created_at) AS day, COUNT(*) AS count
      FROM users
      WHERE created_at >= ${since} AND deleted_at IS NULL
      GROUP BY day ORDER BY day ASC
    `;
  }

  /** Revenu quotidien (paiements Boutique réussis) — distinct du MRR abonnements (Volume 7 §40, jamais mélangés). */
  async getRevenueTrend(days: number) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    return this.db.$queryRaw<{ day: Date; total_cents: bigint }[]>`
      SELECT date_trunc('day', created_at) AS day, COALESCE(SUM(amount_cents), 0) AS total_cents
      FROM payments
      WHERE created_at >= ${since} AND status = 'PAID'
      GROUP BY day ORDER BY day ASC
    `;
  }

  /** Séances complétées par jour — engagement entraînement. */
  async getWorkoutEngagementTrend(days: number) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    return this.db.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', completed_at) AS day, COUNT(*) AS count
      FROM workout_sessions
      WHERE completed_at >= ${since} AND status = 'COMPLETED'
      GROUP BY day ORDER BY day ASC
    `;
  }

  /** Messages Teddy par jour — volume d'usage (distinct du coût, voir `ai.repository.ts#getTeddyCostSummary`). */
  async getTeddyUsageTrend(days: number) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    return this.db.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', created_at) AS day, COUNT(*) AS count
      FROM ai_messages
      WHERE created_at >= ${since}
      GROUP BY day ORDER BY day ASC
    `;
  }

  /**
   * Rétention par cohorte hebdomadaire (Volume 6 : "graphiques Rétention")
   * — pour chaque semaine d'inscription des ~8 dernières semaines, quelle
   * proportion de ces utilisateurs a complété au moins une séance dans les
   * 7 jours suivant leur inscription. Mesure simple et lisible plutôt
   * qu'une matrice de rétention complète (J1/J7/J30/J90) — un vrai moteur
   * de cohortes multi-fenêtres serait le prochain palier si ce premier
   * indicateur s'avère insuffisant à l'usage.
   */
  async getWeeklyRetentionCohorts(weeksBack = 8) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - weeksBack * 7);

    return this.db.$queryRaw<{ cohort_week: Date; cohort_size: bigint; retained_count: bigint }[]>`
      SELECT
        date_trunc('week', u.created_at) AS cohort_week,
        COUNT(DISTINCT u.id) AS cohort_size,
        COUNT(DISTINCT ws.user_id) AS retained_count
      FROM users u
      LEFT JOIN workout_sessions ws
        ON ws.user_id = u.id
        AND ws.status = 'COMPLETED'
        AND ws.completed_at <= u.created_at + INTERVAL '7 days'
      WHERE u.created_at >= ${since} AND u.deleted_at IS NULL
      GROUP BY cohort_week ORDER BY cohort_week ASC
    `;
  }

  async getTopExercises(limit: number) {
    const grouped = await this.db.workoutExercise.groupBy({
      by: ["exerciseId"],
      where: { isCompleted: true },
      _count: true,
      orderBy: { _count: { exerciseId: "desc" } },
      take: limit,
    });
    const exercises = await this.db.exercise.findMany({ where: { id: { in: grouped.map((g) => g.exerciseId) } } });
    const nameById = new Map(exercises.map((e) => [e.id, e.name]));
    return grouped.map((g) => ({ exerciseId: g.exerciseId, exerciseName: nameById.get(g.exerciseId) ?? "Exercice supprimé", completedCount: g._count }));
  }
}
