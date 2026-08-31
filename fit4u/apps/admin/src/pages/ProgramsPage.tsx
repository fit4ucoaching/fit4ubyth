import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ListTree, Trash2 } from "lucide-react";

import { Badge, Card } from "../components/ui";
import { DataTable } from "../components/data-table";
import { apiClient } from "../services/apiClient";

interface ProgramRow {
  id: string;
  name: string;
  goalType: string;
  difficultyLevel: string;
  isPremium: boolean;
}

/** Module Programmes (Volume 4) — CRUD connecté aux routes admin-only existantes (Volume 3). */
export function ProgramsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "programs"],
    queryFn: () => apiClient.get<{ items: ProgramRow[]; total: number }>("/programs?page=1&pageSize=50"),
  });

  const deleteProgram = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/programs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "programs"] }),
  });

  const columns: ColumnDef<ProgramRow>[] = [
    { accessorKey: "name", header: "Nom" },
    { accessorKey: "goalType", header: "Objectif" },
    {
      accessorKey: "isPremium",
      header: "Accès",
      cell: ({ row }) => <Badge variant={row.original.isPremium ? "vip" : "neutral"}>{row.original.isPremium ? "Premium" : "Gratuit"}</Badge>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => deleteProgram.mutate(row.original.id)}
          className="flex items-center gap-1 text-xs text-danger hover:underline"
          aria-label={`Supprimer ${row.original.name}`}
        >
          <Trash2 size={14} /> Supprimer
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <ListTree className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Programmes</h1>
      </div>
      <Card>
        <DataTable columns={columns} data={data?.items ?? []} searchPlaceholder="Rechercher un programme…" />
      </Card>
    </div>
  );
}
