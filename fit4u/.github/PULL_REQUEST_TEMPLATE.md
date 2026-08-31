## Description

<!-- Que fait cette PR ? Pourquoi ? -->

## Type de changement

- [ ] `feat` — nouvelle fonctionnalité
- [ ] `fix` — correction de bug
- [ ] `refactor` — sans changement de comportement
- [ ] `test` — ajout/modification de tests
- [ ] `docs` — documentation uniquement
- [ ] `chore` — maintenance, dépendances
- [ ] `perf` — amélioration de performance
- [ ] `security` — correction de sécurité

## Checklist (Volume 8 §8 — bloquant avant fusion)

- [ ] Les tests unitaires passent (`pnpm test`)
- [ ] Le typecheck passe (`pnpm typecheck`)
- [ ] Le lint passe (`pnpm lint`)
- [ ] Le build passe (`pnpm build`)
- [ ] Aucun secret n'est commité (vérifié par le scan automatique CI)
- [ ] Si migration Prisma : testée localement avec `prisma migrate dev`
- [ ] Si changement de comportement Teddy : comparé à la suite de tests de référence (`packages/teddy-sdk/tests/`)
- [ ] Si changement de permission/rôle : test RBAC ajouté ou mis à jour
- [ ] Documentation mise à jour si le comportement change

## Comment tester

<!-- Étapes pour qu'un reviewer reproduise et valide le changement -->

## Captures d'écran (si applicable)
