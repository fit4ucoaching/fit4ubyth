/**
 * Calcul du MRR — fonction pure, isolée de Prisma pour rester testable
 * sans base de données (cohérent avec le pattern déterministe déjà utilisé
 * dans `@fit4u/teddy-sdk` : la logique de calcul ne doit jamais dépendre
 * de l'accès aux données pour être vérifiée).
 */
export interface BillableSubscription {
  price: { amountCents: number; billingInterval: string } | null;
}

/** Normalise chaque abonnement actif à un montant mensuel équivalent, puis les somme. */
export function computeMonthlyRecurringRevenueCents(subscriptions: BillableSubscription[]): number {
  return subscriptions.reduce((sum, sub) => {
    if (!sub.price) return sum; // abonnement sans prix lié (ex. créé avant migration priceId) — exclu du calcul plutôt que fausser le MRR
    const monthlyCents = sub.price.billingInterval === "YEAR" ? Math.round(sub.price.amountCents / 12) : sub.price.amountCents;
    return sum + monthlyCents;
  }, 0);
}
