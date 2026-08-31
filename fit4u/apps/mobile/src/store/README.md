# État global (mobile)

Un store Zustand par domaine, jamais un store monolithique :

- `useAuthStore`
- `useUserStore`
- `useNutritionStore`
- `useCoachTeddyStore`
- `useWorkoutStore`
- `useShopStore`
- `useCommunityStore`

Chaque store expose un état minimal + des actions typées, et ne contient aucun appel réseau
direct (celui-ci passe par `modules/<domaine>/services`).
