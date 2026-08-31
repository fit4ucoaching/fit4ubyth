import type { ColumnDef } from "@tanstack/react-table";
import { ScrollText } from "lucide-react";
import { useState } from "react";

import { Card } from "../components/ui";
import { DataTable } from "../components/data-table";
import { useAuditLogs, type AuditLogRow } from "../services/useAuditLogs";
import { useRightPanelStore } from "../store/rightPanelStore";

const columns: ColumnDef<AuditLogRow>[] = [
  {
    accessorKey: "admin",
    header: "Qui",
    cell: ({ row }) => row.original.admin.profile ? `${row.original.admin.profile.firstName} ${row.original.admin.profile.lastName}` : row.original.admin.email,
  },
  { accessorKey: "action", header: "Quoi" },
  { accessorKey: "targetType", header: "Cible" },
  {
    accessorKey: "createdAt",
    header: "Quand",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("fr-FR"),
  },
];

/**
 * Journal d'audit (Volume 6) — qui/quand/quoi/avant/après/IP/appareil. Le
 * détail avant/après/IP/appareil s'ouvre dans le `RightPanel` plutôt que
 * d'alourdir chaque ligne de la table.
 */
export function AuditLogsPage(): JSX.Element {
  const [page] = useState(1);
  const { data } = useAuditLogs({ page, pageSize: 20 });
  const openPanel = useRightPanelStore((s) => s.open);

  const columnsWithDetail: ColumnDef<AuditLogRow>[] = [
    ...columns,
    {
      id: "detail",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() =>
            openPanel(
              "Détail de l'action",
              <div className="space-y-3 text-sm">
                <div><span className="text-textTertiary">IP :</span> {row.original.metadata?.ipAddress ?? "—"}</div>
                <div><span className="text-textTertiary">Appareil :</span> {row.original.metadata?.userAgent ?? "—"}</div>
                <div>
                  <span className="text-textTertiary">Avant :</span>
                  <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs">{JSON.stringify(row.original.metadata?.before, null, 2)}</pre>
                </div>
                <div>
                  <span className="text-textTertiary">Après :</span>
                  <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs">{JSON.stringify(row.original.metadata?.after, null, 2)}</pre>
                </div>
              </div>,
            )
          }
          className="text-xs text-primary hover:underline"
        >
          Détail
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <ScrollText className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Audit</h1>
      </div>
      <Card>
        <DataTable columns={columnsWithDetail} data={data?.items ?? []} searchPlaceholder="Rechercher une action…" />
      </Card>
    </div>
  );
}
