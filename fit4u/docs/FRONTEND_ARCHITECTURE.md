# Architecture Frontend — Fit4U by TH

**Master Prompt Volume 4/8 — Document de référence (niveau CTO)**
**Rôle** : Lead Frontend Engineer / Senior Staff Frontend Engineer + Mobile Architect

---

## 1. Vue d'ensemble

Trois applications front, un design system partagé :

| App | Stack | Statut |
|---|---|---|
| `apps/mobile` | Expo/React Native/TypeScript | **Référence complète** — 174 fichiers, design system + 15 features + navigation + state |
| `apps/web` | React/Vite/TypeScript | **Infrastructure + pages de référence** — auth, dashboard, sidebar |
| `apps/admin` | React/Vite/TypeScript (BackOffice) | **Infrastructure + 14 modules** (7 connectés à de vrais endpoints, 5 documentant un gap backend, 2 restants) |

Packages partagés étendus/créés ce volume :
- `@fit4u/ui` — design tokens complets (colors light/dark, spacing, radius, typography, shadows, motion, zIndex) + `buildTheme()`.
- `@fit4u/api-client` (**nouveau**) — client HTTP centralisé (JWT, refresh avec file d'attente anti-rafale, retry+backoff, timeout, requestId), React Query (`queryClient`, `queryKeys`), partagé par les 3 apps via un adaptateur `TokenStorage` injecté.
- `@fit4u/types` — DTO frontend alignés sur le contrat réel du backend Volume 3 (rôles dynamiques, VIP résolu, `roles[]`) plutôt que le contrat simplifié du Volume 1.

## 2. Design System (`packages/ui` + `apps/mobile/src/components`)

24 des 25 composants demandés sont implémentés (Button, Card, Input, Textarea,
Select, SegmentedControl, Modal, Sheet, Dialog, Toast, Badge, Avatar,
Progress, CircularProgress, Tabs, Calendar, Chart [Line+Bar], StatCard,
ExerciseCard, ProgramCard, RecipeCard, TeddyCard, ChallengeCard,
ProductCard). Le 25ᵉ (`Drawer`) est délégué à React Navigation plutôt que
réimplémenté — décision documentée dans `Modal/Sheet.tsx`.

Chaque composant est typé, documenté (JSDoc), et suit les tokens partagés
(jamais de couleur/espacement en dur). Web réutilise les mêmes tokens via
variables CSS (`theme/global.css`) pour une identité visuelle strictement
identique entre plateformes.

## 3. Mobile — architecture détaillée

### État global
9 stores Zustand séparés (Volume 4, explicitement demandé) : `authStore`,
`userStore`, `workoutStore`, `nutritionStore`, `teddyStore`,
`communityStore`, `shopStore`, `uiStore` (+ `adminStore` propre à
`apps/admin`, non pertinent sur mobile). Séparation stricte avec React
Query : Zustand ne contient JAMAIS de données serveur mises en cache —
uniquement de l'état client éphémère (chronomètre de séance en cours,
brouillon de post, mode de thème). Toute donnée serveur transite par un
hook `services/use*.ts`.

### Navigation
`RootNavigator` bascule Auth / Onboarding / Main selon l'authentification
et la complétude du profil (heuristique : `Profile.heightCm` renseigné).
`MainNavigator` (Stack) enveloppe `MainTabNavigator` (5 onglets : Accueil,
Entraînement, Teddy, Nutrition, Profil) et expose la navigation secondaire
(Exercices, Progression, Communauté, Boutique, Gamification) comme écrans
frères accessibles depuis n'importe quel onglet. La bulle Teddy flottante
est montée une seule fois au niveau de `MainNavigator`.

### Features complètes (15)
`auth` (7 écrans + OAuth Google/Apple natifs), `onboarding` (11 étapes,
alimente `Profile`/`UserPreference`), `dashboard` (widgets réordonnables
via feuille dédiée — réordonnancement par boutons haut/bas plutôt que
glisser-déposer gestuel, pour rester accessible VoiceOver/TalkBack),
`teddy` (chat plein écran + bulle flottante + vocal Whisper), `workout`
(programmes → séance live avec chronomètre/repos automatique/remplacement
d'exercice → résumé), `exercises`, `nutrition` (hydratation, scanner
code-barres caméra native, analyse photo Vision), `progress` (graphiques
Victory Native), `gamification`, `community`, `shop` (catalogue → panier →
checkout → intention de paiement Stripe/PayPal), `premium`, `profile`,
`settings`.

### Offline & natif
- Réseau : `expo-network` alimente `uiStore.isOffline` (bandeau global) ;
  React Query relance automatiquement au retour du réseau
  (`refetchOnReconnect`, activé par défaut).
- Pas : `expo-sensors` (Pedometer), donnée 100% device-local, aucun
  backend requis.
- **Sommeil** : aucune source de données (ni capteur natif simple, ni table
  backend) — widget prévu dans l'UI (`StatCard`) mais non alimenté ; nécessite
  une intégration HealthKit/Google Fit (hors périmètre Expo managé).
- **Widgets natifs (Android/iPhone Home Screen, Apple Watch, Wear OS)** :
  non implémentés — nécessitent des modules natifs (Widget​Kit/Glance) hors
  du workflow Expo managé standard ; point d'extension documenté, pas de
  simplification silencieuse.

## 4. Web — pages de référence

Infrastructure complète (thème, client API, stores, Sidebar permanente
responsive avec navigation clavier native via `NavLink`) + `LoginPage`,
`RegisterPage`, `DashboardPage`. Les pages restantes (Entraînement,
Nutrition, Progression, Communauté, Boutique, Défis, Profil, Paramètres,
Teddy) suivent exactement le même pattern — non dupliquées avec le détail
mobile dans ce volume pour rester dans un périmètre raisonnable, la logique
métier étant déjà validée côté mobile et les hooks `services/use*` réutilisables tels quels.

## 5. BackOffice (`apps/admin`)

14 modules dans la Sidebar. Répartition réelle :

| Connectés à un vrai endpoint (Volume 3) | Documentent un gap backend |
|---|---|
| Dashboard, VIP, Exercices, Programmes, Support, Paramètres (feature flags), Monitoring (readiness) | Utilisateurs, Teddy, Nutrition, Boutique, Paiements (vue globale), Analytics (partiel), Sauvegardes |

`DataTable` (TanStack Table headless) centralise recherche/tri/pagination —
réutilisé par tous les modules plutôt que dupliqué. `VipPage` est le module
le plus complet : formulaire d'octroi + table avec révocation, conforme à
`VipAccessService` (Volume 3). Les modules "gap backend" affichent
honnêtement le contrat d'endpoint attendu (`ComingSoonPage` / encart dédié)
plutôt que des données simulées — cohérent avec la transparence déjà
pratiquée aux Volumes 2 et 3 pour les écarts spec/implémentation.

## 6. Écarts documentés (Volume 4 → prochains volumes)

1. **i18n non branché dans les composants** : les 6 locales (`fr/en/es/de/it/pt`)
   et la config i18next existent (Volume 1) mais les écrans construits ce
   volume utilisent des chaînes françaises en dur plutôt que `t("clé")`.
   Retrofit nécessaire avant un lancement multilingue réel — infrastructure
   prête, ~50 écrans à connecter.
2. **Endpoints admin manquants** côté backend (voir tableau §5) — à ajouter
   au module `admin` (Volume 3) : `GET /admin/users`, gestion catalogue
   Boutique, vue Paiements globale, déclenchement/historique Sauvegardes.
3. **Web/Admin** : seules les pages de référence sont construites ; le
   reste du catalogue d'écrans suit le pattern établi mais n'a pas été
   dupliqué intégralement depuis mobile dans ce volume.
4. **Widgets natifs et Apple Watch/Wear OS** : non implémentés (nécessitent
   du développement natif hors Expo managé).

## 7. Validation effectuée

Sans accès à `tsc`/Metro/Vite réels en sandbox, validation structurelle
automatisée sur les 3 apps (247 fichiers `.ts`/`.tsx` au total) : équilibre
des accolades, résolution de tous les imports relatifs, correspondance des
imports nommés avec les exports réels (script corrigé en cours de route
pour gérer la syntaxe `{ x, type Y }`). Un bug réel détecté et corrigé
(mauvais chemin d'import de `MainTabParamList` dans `DashboardScreen`) ;
tous les autres signalements initiaux étaient des faux positifs de script,
vérifiés manuellement un par un.
