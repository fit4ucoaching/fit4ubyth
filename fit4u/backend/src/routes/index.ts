import { Router } from "express";

import { aiRouter } from "../ai/ai.routes";
import { adminRouter } from "../modules/admin/admin.routes";
import { analyticsRouter } from "../modules/analytics/analytics.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { communityRouter } from "../modules/community/community.routes";
import { entitlementsRouter } from "../modules/entitlements/entitlements.routes";
import { exercisesRouter } from "../modules/exercises/exercises.routes";
import { gamificationRouter } from "../modules/gamification/gamification.routes";
import { nutritionRouter } from "../modules/nutrition/nutrition.routes";
import { paymentsRouter } from "../modules/payments/payments.routes";
import { privacyRouter } from "../modules/privacy/privacy.routes";
import { profilesRouter } from "../modules/profiles/profiles.routes";
import { programsRouter } from "../modules/programs/programs.routes";
import { progressRouter } from "../modules/progress/progress.routes";
import { shopRouter } from "../modules/shop/shop.routes";
import { subscriptionsRouter } from "../modules/subscriptions/subscriptions.routes";
import { usersRouter } from "../modules/users/users.routes";
import { workoutsRouter } from "../modules/workouts/workouts.routes";
import { shopifyRouter } from "../shopify/shopify.routes";

/**
 * Point unique d'assemblage des routeurs de modules — monté sous `/api/v1`
 * par `app.ts` (Volume 3 : "Préfixer toutes les routes /api/v1. Préparer
 * l'évolution /api/v2"). Chaque module reste propriétaire de ses chemins
 * internes ; ce fichier ne fait qu'attribuer le préfixe de premier niveau.
 *
 * `nutritionRouter` et `communityRouter` sont montés à la racine (`/`) :
 * leurs routes (`/foods`, `/posts`, `/nutrition/water`…) incluent déjà leur
 * propre segment tel que spécifié par le Master Prompt Volume 3, qui ne les
 * préfixe pas par `/nutrition` ou `/community`.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/profiles", profilesRouter);
apiRouter.use("/exercises", exercisesRouter);
apiRouter.use("/programs", programsRouter);
apiRouter.use("/workouts", workoutsRouter);
apiRouter.use("/", nutritionRouter);
apiRouter.use("/teddy", aiRouter);
apiRouter.use("/progress", progressRouter);
apiRouter.use("/gamification", gamificationRouter);
apiRouter.use("/", communityRouter);
apiRouter.use("/shop", shopRouter);
apiRouter.use("/", shopifyRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/subscriptions", subscriptionsRouter);
apiRouter.use("/entitlements", entitlementsRouter);
apiRouter.use("/privacy", privacyRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/analytics", analyticsRouter);
