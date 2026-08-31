import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Plus } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Card, Input } from "../components/ui";
import { DataTable } from "../components/data-table";
import {
  useAdminCancelSubscription, useCreatePlan, usePlansList,
  useSubscriptionsList, useTogglePlanActive, type SubscriptionRow,
} from "../services/useAdminSubscriptions";
import { useUiStore } from "../store/uiStore";

const STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  ACTIVE: "success", TRIALING: "success", PAST_DUE: "danger",
  CANCELED: "neutral", EXPIRED: "neutral", INCOMPLETE: "neutral", PAUSED: "neutral",
};

/**
 * Module Abonnements (Volume 6, débloqué par le schéma Volume 7) —
 * catalogue d'offres (créer/activer/désactiver) + liste de tous les
 * abonnements avec annulation admin. La création de PRIX reste volontairement
 * absente de cette page (nécessite l'identifiant du prix côté prestataire,
 * généralement créé depuis le Dashboard Stripe puis reporté ici — pas une
 * saisie libre côté BackOffice, pour éviter une désynchronisation).
 */
export function SubscriptionsPage(): JSX.Element {
  const { data: plans } = usePlansList();
  const createPlan = useCreatePlan();
  const toggleActive = useTogglePlanActive();
  const cancelSubscription = useAdminCancelSubscription();
  const pushToast = useUiStore((s) => s.pushToast);
  const [page] = useState(1);
  const { data: subscriptions } = useSubscriptionsList({ page, pageSize: 20 });

  const [newPlan, setNewPlan] = useState({ key: "", name: "", accessLevel: "PREMIUM" });

  const handleCreatePlan = (): void => {
    if (!newPlan.key || !newPlan.name) return;
    createPlan.mutate(newPlan, {
      onSuccess: () => {
        setNewPlan({ key: "", name: "", accessLevel: "PREMIUM" });
        pushToast({ variant: "success", message: "Offre créée." });
      },
    });
  };

  const columns: ColumnDef<SubscriptionRow>[] = [
    {
      accessorKey: "user",
      header: "Utilisateur",
      cell: ({ row }) => row.original.user.profile ? `${row.original.user.profile.firstName} ${row.original.user.profile.lastName}` : row.original.user.email,
    },
    { accessorKey: "plan.name", header: "Offre", cell: ({ row }) => row.original.plan.name },
    { accessorKey: "provider", header: "Prestataire" },
    { accessorKey: "status", header: "Statut", cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status] ?? "neutral"}>{row.original.status}</Badge> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        ["ACTIVE", "TRIALING", "PAST_DUE"].includes(row.original.status) ? (
          <button
            onClick={() => cancelSubscription.mutate({ id: row.original.id, immediately: false }, { onSuccess: () => pushToast({ variant: "success", message: "Annulation programmée en fin de période." }) })}
            className="text-xs text-danger hover:underline"
          >
            Annuler
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <CreditCard className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Abonnements</h1>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-textPrimary">Catalogue d'offres</h2>
        <div className="mb-4 flex flex-wrap items-end gap-3 border-b border-border pb-4">
          <div className="w-40"><Input label="Clé" placeholder="FIT4U_PRO" value={newPlan.key} onChange={(e) => setNewPlan({ ...newPlan, key: e.target.value })} /></div>
          <div className="flex-1 min-w-[160px]"><Input label="Nom" placeholder="Fit4U Pro" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} /></div>
          <select
            value={newPlan.accessLevel}
            onChange={(e) => setNewPlan({ ...newPlan, accessLevel: e.target.value })}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-textPrimary"
            aria-label="Niveau d'accès"
          >
            <option value="PREMIUM">Premium</option>
            <option value="PRO">Pro</option>
          </select>
          <Button onClick={handleCreatePlan} isLoading={createPlan.isPending}><Plus size={16} className="mr-2" />Créer l'offre</Button>
        </div>

        <div className="space-y-2">
          {(plans ?? []).map((plan) => (
            <div key={plan.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-semibold text-textPrimary">{plan.name} <span className="font-mono text-xs text-textTertiary">({plan.key})</span></p>
                <p className="text-xs text-textSecondary">{plan.accessLevel} · {plan.prices.length} prix configuré(s)</p>
              </div>
              <button
                onClick={() => toggleActive.mutate({ id: plan.id, isActive: !plan.isActive })}
                className={`h-6 w-11 rounded-full transition-colors ${plan.isActive ? "bg-primary" : "bg-surface"}`}
                aria-label={`${plan.isActive ? "Désactiver" : "Activer"} ${plan.name}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${plan.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-textPrimary">Abonnements actifs</h2>
        <DataTable columns={columns} data={subscriptions?.items ?? []} searchPlaceholder="Rechercher un utilisateur…" />
      </Card>
    </div>
  );
}
