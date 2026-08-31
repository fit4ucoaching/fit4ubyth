# Evolution — Teddy AI Engine

Points d'extension documentés (Volume 5) — non implémentés dans ce volume,
proposés explicitement plutôt que simplifiés silencieusement.

## Teddy Family

*"Chaque membre possède son compte, sa mémoire, ses objectifs. Le
responsable peut créer des défis familiaux, objectifs communs, événements.
Respecter la confidentialité individuelle."*

**Schéma Prisma nécessaire** (extension du Volume 2, domaine Administration
ou nouveau domaine "Famille") :

```prisma
model Family {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  ownerId   String   @map("owner_id") @db.Uuid
  owner     User     @relation("FamilyOwner", fields: [ownerId], references: [id])
  members   FamilyMember[]
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
}

model FamilyMember {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  familyId  String   @map("family_id") @db.Uuid
  family    Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  userId    String   @map("user_id") @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt  DateTime @default(now()) @map("joined_at") @db.Timestamptz(6)

  @@unique([familyId, userId])
}
```

**Confidentialité individuelle** : `FamilyMember` ne donne accès qu'aux
défis/objectifs COMMUNS (nouvelle table `FamilyChallenge`, réutilisant le
pattern `Challenge`/`UserChallenge` du Volume 2) — jamais à la mémoire
individuelle complète d'un autre membre (`AIMemory`, `WeightHistory`, etc.
restent strictement scopés à `userId`, jamais élargis au niveau famille).

## Teddy CEO

*"Assistant IA pour l'administrateur : KPI, anomalies, recommandations
produit/marketing, rapports automatiques."*

**Construit (revue continue post-Volume 8)** : `backend/src/ai/ceo/` +
`packages/teddy-sdk/src/ceo/` — persona et prompts entièrement DISTINCTS du
coach utilisateur (jamais de mélange), 4 outils réels (`GetKPISummary`,
`DetectAnomalies`, `GetChurnRiskUsers`, `GetTopPerformingPrograms`),
endpoint `POST /admin/teddy-ceo/chat` (permission `teddy.read`).

**Décision d'architecture importante** : `detectTrend()` (SDK analytics,
conçu pour l'adhérence d'UN utilisateur) n'a pas été réutilisé pour les
anomalies plateforme — sémantiquement incompatible (un "taux d'adhérence"
n'a pas de sens pour un revenu global). Une fonction dédiée
(`ceoAnomalyDetection.ts#detectPlatformAnomalies()`, testée
unitairement) compare plutôt des paires de métriques période courante/
période précédente (revenu, séances complétées, nouveaux inscrits) et
signale tout écart au-delà d'un seuil configurable (20% par défaut).

**Limite connue, documentée plutôt que masquée** : l'architecture en 2
phases héritée du Volume 5 (`initiateCeoTurn`/`completeCeoTurn`, comme
`initiateTeddyTurn`/`completeTeddyTurn`) ne supporte qu'UN SEUL aller-retour
d'appels d'outils — un enchaînement où le modèle voudrait appeler un outil
B en fonction du résultat de l'outil A n'est pas possible à ce jour, côté
CEO comme côté coach utilisateur (bug de boucle latent identifié dans
`ai.service.ts` à cette occasion, commentaire corrigé). Une vraie
généralisation nécessiterait de faire boucler `completeTeddyTurn`/
`completeCeoTurn` elles-mêmes plutôt que de toujours forcer un statut final.

**Non construit** : rapports automatiques planifiés (le CEO répond à la
demande, jamais de push quotidien programmé) ; interface BackOffice de
chat dédiée (l'API est prête, aucun écran `apps/admin` ne l'exploite encore).

## Workflow Engine — exécuteur pas-à-pas

`workflows/loseWeightWorkflow.ts` définit la séquence ; un
`workflowEngine.ts` qui l'exécute réellement étape par étape (appelant
`toolExecutor.ts` à chaque étape marquée `toolName`) n'a pas été construit
— le seul workflow actuellement défini sert de référence de pattern. À
construire dès qu'un deuxième workflow est nécessaire (le coût de
généraliser avant d'avoir 2 cas d'usage réels serait prématuré).

## Vision quantitative

Remplacer/compléter `vision/teddyVision.ts` (qualitatif, LLM multimodal sur
image fixe) par un pipeline MediaPipe Pose ou OpenPose opérant sur une
séquence vidéo, pour de vraies mesures d'angles articulaires/amplitude/vitesse.

## Déclenchement périodique Memory/DNA

`memory/summarize.ts` et `memory/teddyDNA.ts` sont prêts mais pas encore
appelés automatiquement. Proposition : un job BullMQ (`backend/src/jobs/`)
déclenché tous les N messages (compteur sur `AIConversation`) ou
quotidiennement pour les conversations actives.

## Teddy Daily/Weekly/Monthly — personnalisation par utilisateur

Les jobs `dailyReport`/`weeklyReport`/`monthlyReport` (Volume 3) génèrent
aujourd'hui des agrégats ADMIN (nombre total d'inscriptions, séances...).
Volume 5 demande des messages PERSONNALISÉS par utilisateur ("Bonjour
[Prénom]..."). Proposition : nouveaux jobs `teddyDailyMessage`/
`teddyWeeklyReport`/`teddyMonthlyReport` itérant sur les utilisateurs actifs,
utilisant `analytics/teddyAnalytics.ts` + `motivation/teddyMotivation.ts`
pour générer et pousser (via `notificationQueue`, Volume 3) un message
individuel — non construit ce volume pour rester dans un périmètre
raisonnable, le pattern étant strictement identique à `subscription.job.ts`
(itération sur utilisateurs + `notificationQueue.add`).
