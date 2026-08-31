import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Crown, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Badge, Button, Card, Input } from "../components/ui";
import { DataTable } from "../components/data-table";
import { useAdminVipList, useGrantVip, useImportVipCsv, useRevokeVip, type VipAccessRow } from "../services/useAdminVip";
import { useUiStore } from "../store/uiStore";

const grantVipSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  isLifetime: z.boolean().default(false),
  note: z.string().max(280).optional(),
});
type GrantVipFormValues = z.infer<typeof grantVipSchema>;

const columns: ColumnDef<VipAccessRow>[] = [
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "isActive",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "success" : "neutral"}>
        {row.original.isActive ? "Actif" : "Révoqué"}
      </Badge>
    ),
  },
  {
    accessorKey: "isLifetime",
    header: "Durée",
    cell: ({ row }) => (row.original.isLifetime ? "À vie" : row.original.endDate ? new Date(row.original.endDate).toLocaleDateString("fr-FR") : "—"),
  },
  { accessorKey: "note", header: "Note" },
];

/**
 * Module VIP (Volume 4) — grant/revoke conforme à `services/vipAccess.service.ts`
 * (Volume 3) : une adresse email présente et active obtient automatiquement
 * `subscription = VIP` à sa prochaine authentification.
 */
export function VipPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const { data } = useAdminVipList({ page, pageSize: 20 });
  const grantVip = useGrantVip();
  const revokeVip = useRevokeVip();
  const importVipCsv = useImportVipCsv();
  const pushToast = useUiStore((s) => s.pushToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvFileSelected = async (file: File): Promise<void> => {
    const csvContent = await file.text();
    importVipCsv.mutate(
      { csvContent, isLifetime: true },
      {
        onSuccess: (result) =>
          pushToast({
            variant: "success",
            message: `${result.importedCount} accès VIP importés (${result.invalidCount} ligne(s) invalide(s) sur ${result.totalLines}).`,
          }),
        onError: () => pushToast({ variant: "error", message: "Échec de l'import CSV." }),
      },
    );
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GrantVipFormValues>({
    resolver: zodResolver(grantVipSchema),
    defaultValues: { isLifetime: true },
  });

  const onSubmit = handleSubmit((values) => {
    grantVip.mutate(values, {
      onSuccess: () => {
        pushToast({ variant: "success", message: `Accès VIP accordé à ${values.email}.` });
        reset();
      },
      onError: () => pushToast({ variant: "error", message: "Impossible d'accorder l'accès VIP." }),
    });
  });

  const columnsWithActions: ColumnDef<VipAccessRow>[] = [
    ...columns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.isActive ? (
          <button
            onClick={() => revokeVip.mutate(row.original.id)}
            className="flex items-center gap-1 text-xs text-danger hover:underline"
            aria-label={`Révoquer l'accès VIP de ${row.original.email}`}
          >
            <Trash2 size={14} /> Révoquer
          </button>
        ) : null,
    },
  ];

  void page;
  void setPage;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Crown className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Accès VIP</h1>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Controller control={control} name="email" render={({ field }) => (
              <Input label="Email à accorder" error={errors.email?.message} {...field} />
            )} />
          </div>
          <div className="min-w-[240px] flex-1">
            <Controller control={control} name="note" render={({ field }) => (
              <Input label="Note (optionnel)" {...field} />
            )} />
          </div>
          <Button type="submit" isLoading={grantVip.isPending}>Accorder l'accès VIP</Button>

          <div className="ml-auto flex items-center gap-2 border-l border-border pl-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCsvFileSelected(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              isLoading={importVipCsv.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-2" /> Importer un CSV
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-textTertiary">
          Format CSV attendu : une adresse par ligne, avec une note optionnelle séparée par une virgule (<code>email,note</code>).
        </p>
      </Card>

      <Card>
        <DataTable columns={columnsWithActions} data={data?.items ?? []} searchPlaceholder="Rechercher un email…" />
      </Card>
    </div>
  );
}
