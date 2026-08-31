# Load Testing — Fit4U by TH (Volume 8 §22)

## Statut

**Scripts IMPLEMENTED, jamais VERIFIED** (voir `docs/PROJECT_STATUS.md`) —
aucune exécution réelle contre une infrastructure de staging n'a eu lieu.

## Outil

[k6](https://k6.io/) — scriptable en JavaScript, adapté aux paliers de
charge progressifs demandés (§22 : "Commencer par 100, 1 000, 10 000
utilisateurs").

## Exécution (une fois k6 installé)

```bash
k6 run --env BASE_URL=https://staging.fit4u.app scripts/load-testing/smoke.js
k6 run --env BASE_URL=https://staging.fit4u.app scripts/load-testing/ramp-100.js
k6 run --env BASE_URL=https://staging.fit4u.app scripts/load-testing/ramp-1000.js
```

**Ne jamais exécuter ces scripts contre `production`** sans fenêtre de
maintenance planifiée et équipe prévenue — une charge de 1 000+
utilisateurs virtuels peut dégrader le service réel.

## Progression (§22)

Ne pas sauter d'étape : valider 100 VUs avant de tenter 1 000, valider
1 000 avant 10 000. "Ne jamais prétendre supporter plusieurs millions
d'utilisateurs sans tests et infrastructure correspondants" — les paliers
au-delà de 10 000 dépendent de l'infrastructure réellement provisionnée,
non définie à ce stade (voir `docs/deployment.md`).
