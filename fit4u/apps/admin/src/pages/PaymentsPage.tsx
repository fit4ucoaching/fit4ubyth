import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import { useState } from "react";

import { Badge, Card } from "../components/ui";
import { DataTable } from "../components/data-table";
import { usePaymentsOverview, useAdminPaymentsList } from "../services/useAdminPayments";

interface PaymentRow {
  id: string;
  status: string;
  amountCents: number;
  createdAt: string;
  user: { profile: { firstName: string; lastName: string } | null; email: string };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

const STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  PAID: "success", FAILED: "danger", REFUNDED: "neutral", PENDING: "neutral",
};

const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: "user",
    header: "Utilisateur",
    cell: ({ row }) => row.original.user.profile ? `${row.original.user.profile.firstName} ${row.original.user.profile.lastName}` : row.original.user.email,
  },
  { accessorKey: "amountCents", header: "Montant", cell: ({ row }) => formatCurrency(row.original.amountCents) },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status] ?? "neutral"}>{row.original.status}</Badge>,
  },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("fr-FR") },
];

/**
 * Dashboard Paiements (Volume 6 : "MRR, ARR, LTV, taux de conversion").
 * Le MRR est une estimation depuis les paiements des 30 derniers jours —
 * voir l'avertissement affiché et `docs/Modules.md` pour le détail du calcul.
 */
export function PaymentsPage(): JSX.Element {
  const { data: overview } = usePaymentsOverview();
  const [page] = useState(1);
  const { data } = useAdminPaymentsList({ page, pageSize: 20 }) as { data: { items: PaymentRow[]; total: number } | undefined };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <CreditCard className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Paiements</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><p className="text-xs text-textSecondary">MRR</p><p className="text-xl font-bold text-textPrimary">{formatCurrency(overview?.mrrCents ?? 0)}</p></Card>
        <Card><p className="text-xs text-textSecondary">ARR</p><p className="text-xl font-bold text-textPrimary">{formatCurrency(overview?.arrCents ?? 0)}</p></Card>
        <Card><p className="text-xs text-textSecondary">Abonnements actifs</p><p className="text-xl font-bold text-textPrimary">{overview?.activeSubscriptionsCount ?? "—"}</p></Card>
        <Card><p className="text-xs text-textSecondary">VIP actifs</p><p className="text-xl font-bold text-textPrimary">{overview?.activeVip ?? "—"}</p></Card>
        <Card><p className="text-xs text-textSecondary">Taux de conversion</p><p className="text-xl font-bold text-textPrimary">{overview ? `${(overview.conversionRate * 100).toFixed(1)}%` : "—"}</p></Card>
      </div>

      <p className="text-xs text-textTertiary">
        MRR calculé à partir des abonnements digitaux réellement actifs et de leur tarif exact
        (abonnements annuels normalisés au mois) — n'inclut pas les revenus ponctuels de la Boutique,
        volontairement séparés (voir docs/subscriptions/README.md).
      </p>

      <Card>
        <DataTable columns={columns} data={data?.items ?? []} searchPlaceholder="Rechercher un paiement…" />
      </Card>
    </div>
  );
}
