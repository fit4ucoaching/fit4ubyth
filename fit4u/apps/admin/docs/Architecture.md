# Architecture — BackOffice ERP

**Master Prompt Volume 6/8** — `apps/admin`, communique exclusivement avec
`/api/v1/admin`. Aucune logique métier dans le frontend : toute règle de
gestion (calcul de MRR, validation d'import CSV, décision d'audit) vit
côté backend.

## Stack

React + TypeScript + Vite · Tailwind CSS + composants maison façon
shadcn/ui · Lucide Icons · Recharts · Zustand + React Query · TanStack
Table · React Hook Form + Zod.

## Layout

```
TopBar (recherche globale, rôle courant, notifications)
  ↓
Sidebar (18 sections, filtrées par permission)
  ↓
Content (Outlet React Router)
  ↓
RightPanel (optionnel — détail contextuel sans quitter la page, ex. Audit)
```

`AppLayout.tsx` assemble ces 4 zones. `RightPanel` est piloté par
`store/rightPanelStore.ts` — n'importe quelle page peut l'ouvrir
(`useRightPanelStore().open(title, content)`) sans navigation.

## Séparation des responsabilités

- **`pages/`** — un composant par route, orchestre les hooks et le layout de la page.
- **`services/use*.ts`** — un hook React Query par ressource backend ; aucune page n'appelle `apiClient` directement.
- **`components/data-table/DataTable.tsx`** — table générique (recherche/tri/pagination) réutilisée par tous les modules à données tabulaires, jamais réimplémentée par page.
- **`hooks/usePermissions.ts`** — source unique de vérité pour afficher/masquer une section ou désactiver une action ; le contrôle réel reste toujours serveur.
- **`store/`** — état UI uniquement (session, toasts, RightPanel, sélection de lignes) ; aucune donnée serveur mise en cache ici (rôle de React Query).

## Ce qui n'est pas construit ce volume

Modules affichant `ComingSoonPage` faute d'endpoint backend dédié : Teddy
Control Center, Nutrition (CMS), Boutique, Abonnements, Communauté,
Analytics (BI complet). Voir `Modules.md` pour le détail module par module
et le contrat d'endpoint attendu.
