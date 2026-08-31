import type { ColumnDef } from "@tanstack/react-table";
import { LifeBuoy } from "lucide-react";
import { useState } from "react";

import { Badge, Card } from "../components/ui";
import { DataTable } from "../components/data-table";
import { apiClient } from "../services/apiClient";
import { useQuery } from "@tanstack/react-query";

interface SupportTicketRow {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "primary" | "success" | "neutral"> = {
  OPEN: "primary", IN_PROGRESS: "primary", RESOLVED: "success", CLOSED: "neutral",
};

const columns: ColumnDef<SupportTicketRow>[] = [
  { accessorKey: "subject", header: "Sujet" },
  { accessorKey: "priority", header: "Priorité" },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("fr-FR"),
  },
];

/** Module Support (Volume 4) — connecté à `/admin/support/tickets` (Volume 3, réel). */
export function SupportPage(): JSX.Element {
  const [page] = useState(1);
  const { data } = useQuery({
    queryKey: ["admin", "support", "tickets", page],
    queryFn: () =>
      apiClient.get<{ items: SupportTicketRow[]; total: number }>(`/admin/support/tickets?page=${page}&pageSize=20`),
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <LifeBuoy className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Support</h1>
      </div>
      <Card>
        <DataTable columns={columns} data={data?.items ?? []} searchPlaceholder="Rechercher un ticket…" />
      </Card>
    </div>
  );
}
