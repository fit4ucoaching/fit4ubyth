# Composants partagés (@fit4u/ui)

Chaque composant doit être :

- petit et centré sur une seule responsabilité ;
- réutilisable entre `apps/mobile`, `apps/web` et `apps/admin` ;
- documenté (JSDoc + exemple d'usage) ;
- accompagné d'un test.

Structure attendue par composant :

```
Button/
  Button.tsx
  Button.types.ts
  Button.test.tsx
  index.ts
```
