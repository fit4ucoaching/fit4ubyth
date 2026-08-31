# Disaster Recovery — Fit4U by TH

## Procédure d'incident (Volume 8 §50)

```
Détection (alerte monitoring OU signalement)
  ↓
Classification (sévérité : mineur / majeur / critique)
  ↓
Containment (limiter l'impact — ex. désactiver une fonctionnalité via Feature Flag plutôt que rollback complet si possible)
  ↓
Resolution (correctif ou rollback, voir docs/rollback.md)
  ↓
Verification (health checks + smoke tests + surveillance renforcée)
  ↓
Postmortem (si incident majeur/critique — voir section dédiée)
```

## Responsables

⚠️ **À définir avec l'équipe réelle** — ce squelette ne peut pas assigner
de nom de personne. Structure recommandée : un rôle "personne d'astreinte"
(rotation), un rôle "décideur rollback" (peut décider sans validation
supplémentaire en cas d'incident critique), un rôle "communication"
(tient informés utilisateurs/équipe).

## RTO / RPO

Voir `docs/production.md#rto--rpo` — objectifs cibles non encore
vérifiés par un exercice de restauration réel.

## Stratégie de sauvegarde (Volume 8 §25)

PostgreSQL : sauvegardes automatiques quotidiennes, chiffrées au repos,
stockage séparé de l'instance principale (autre région/compte selon
l'hébergeur), conservation 30 jours minimum recommandée. **Mécanisme
concret dépendant de l'hébergeur retenu** (non tranché) — la plupart des
providers managés (RDS, Supabase, Neon) fournissent ce mécanisme
nativement ; sinon, `pg_dump` planifié via un job dédié (BullMQ,
suivant le pattern de `backupQueue`, Volume 3) vers un stockage objet
chiffré (S3 + SSE).

## Test de restauration (Volume 8 §26)

**Aucun test de restauration n'a été effectué à ce jour** (voir
`docs/PROJECT_STATUS.md`). Procédure recommandée, à exécuter
périodiquement (trimestriellement a minima) :

```
1. Restaurer le dernier backup sur une instance PostgreSQL isolée (jamais production)
2. Vérifier l'intégrité (comptage de lignes sur les tables critiques, contraintes FK valides)
3. Pointer un backend de test sur cette instance restaurée
4. Exécuter les smoke tests (§47) contre ce backend de test
5. Documenter la durée totale — alimente la révision du RTO réel
```

## Communication en cas d'incident

1. Statut interne immédiat (canal d'astreinte de l'équipe).
2. Si impact utilisateur visible : page de statut ou notification in-app
   (aucun mécanisme de page de statut n'est construit dans ce squelette —
   point d'extension).
3. Post-résolution : résumé aux utilisateurs affectés si l'incident a eu
   un impact sur leurs données ou leur accès.

## Postmortem (Volume 8 §51)

Après tout incident majeur/critique, documenter : cause, impact (nombre
d'utilisateurs/durée), détection (comment/quand), résolution, actions
correctives (immédiates), actions préventives (structurelles). **Le but
est d'améliorer le système, jamais de chercher un responsable** — ce
principe doit être répété au début de chaque réunion de postmortem.

Template recommandé : `docs/postmortem-template.md`.
