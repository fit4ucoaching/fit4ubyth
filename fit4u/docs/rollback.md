# Rollback — Fit4U by TH

## Principe (Volume 8 §35)

```
Nouvelle version déployée
  ↓
Erreur détectée (smoke tests échoués OU alerte monitoring)
  ↓
Stop (arrêter tout déploiement en cours, ne pas propager plus loin)
  ↓
Rollback (revenir à la version précédente connue comme saine)
  ↓
Health Check (confirmer /health/ready OK sur la version restaurée)
```

## Rollback applicatif (code)

Redéployer le tag/commit précédent — dépend du mécanisme de déploiement
de l'hébergeur retenu (non tranché, voir `docs/deployment.md`). Principe
générique : chaque déploiement doit être identifié par un tag Git
immuable (`v1.2.3`), permettant de redéployer exactement l'état
précédent sans reconstruire depuis `main` (qui aurait pu avancer).

## Rollback de migration (base de données)

**Le plus sensible** — Volume 8 §23-24 : "Les migrations destructives
nécessitent une procédure spécifique et une sauvegarde vérifiée."

- Une migration **additive** (nouvelle colonne nullable, nouvelle table)
  est presque toujours sûre à laisser en place même si le code applicatif
  est rollback — l'ancien code ignore simplement la nouvelle colonne.
- Une migration **destructive** (colonne supprimée, table supprimée,
  colonne rendue `NOT NULL`) **ne doit jamais être appliquée en même
  temps que le déploiement du code qui en dépend** — toujours en deux
  étapes séparées (migration additive compatible d'abord, nettoyage
  destructif seulement après confirmation que le rollback applicatif
  n'est plus nécessaire).
- En cas de nécessité absolue de rollback après une migration
  destructive : restauration depuis le dernier backup vérifié (voir
  `docs/disaster-recovery.md`) — accepter la perte de données depuis ce
  backup (voir RPO, `docs/production.md`).

## Déclenchement

Manuel, décidé par la personne d'astreinte au vu des smoke tests
post-déploiement ou d'une alerte monitoring. Aucun rollback automatique
n'est configuré dans ce squelette (§35 ne l'exige pas explicitement,
et un rollback automatique mal calibré peut aggraver un incident).

## Après un rollback

1. Confirmer `/health/ready` OK sur la version restaurée.
2. Communiquer l'incident (voir `docs/disaster-recovery.md#communication`).
3. Ouvrir un post-mortem si l'incident a eu un impact utilisateur (Volume 8 §51).
