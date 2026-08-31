import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Dumbbell, Trash2 } from "lucide-react";

import { Badge, Card } from "../components/ui";
import { DataTable } from "../components/data-table";
import { apiClient } from "../services/apiClient";

interface ExerciseRow {
  id: string;
  name: string;
  difficultyLevel: string;
  category: { name: string };
}

/** Module Exercices (Volume 4) — CRUD connecté aux routes admin-only existantes (Volume 3). */
export function ExercisesPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "exercises"],
    queryFn: () => apiClient.get<{ items: ExerciseRow[]; total: number }>("/exercises?page=1&pageSize=50"),
  });

  const deleteExercise = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/exercises/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] }),
  });

  const columns: ColumnDef<ExerciseRow>[] = [
    { accessorKey: "name", header: "Nom" },
    { accessorKey: "category.name", header: "Catégorie", cell: ({ row }) => row.original.category?.name },
    {
      accessorKey: "difficultyLevel",
      header: "Niveau",
      cell: ({ row }) => <Badge variant="neutral">{row.original.difficultyLevel}</Badge>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => deleteExercise.mutate(row.original.id)}
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
        <Dumbbell className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Exercices</h1>
      </div>
      <Card>
        <DataTable columns={columns} data={data?.items ?? []} searchPlaceholder="Rechercher un exercice…" />
      </Card>
    </div>
  );
}
