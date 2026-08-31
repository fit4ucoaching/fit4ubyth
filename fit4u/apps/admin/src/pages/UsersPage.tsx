import type { ColumnDef } from "@tanstack/react-table";
import { Crown, KeyRound, ShieldOff, ShieldCheck, Trash2, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge, Card } from "../components/ui";
import { DataTable } from "../components/data-table";
import { usePermissions } from "../hooks/usePermissions";
import {
  useAdminUsersList, useDeleteUser, useReactivateUser, useResetUserPassword, useSuspendUser,
  type AdminUserRow,
} from "../services/useAdminUsers";
import { useUiStore } from "../store/uiStore";

const STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  ACTIVE: "success", SUSPENDED: "danger", PENDING: "neutral", DELETED: "neutral",
};

/**
 * Module Utilisateurs (Volume 6) — liste complète, recherche, filtres,
 * actions (suspendre/réactiver/supprimer/reset mot de passe). Fiche
 * complète accessible via clic sur une ligne → `UserDetailPage`.
 */
export function UsersPage(): JSX.Element {
  const [page] = useState(1);
  const navigate = useNavigate();
  const { can } = usePermissions();
  const pushToast = useUiStore((s) => s.pushToast);

  const { data } = useAdminUsersList({ page, pageSize: 20 });
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();

  const columns: ColumnDef<AdminUserRow>[] = [
    {
      accessorKey: "email",
      header: "Utilisateur",
      cell: ({ row }) => (
        <button onClick={() => navigate(`/users/${row.original.id}`)} className="text-left hover:underline">
          <div className="font-medium text-textPrimary">
            {row.original.profile ? `${row.original.profile.firstName} ${row.original.profile.lastName}` : "—"}
          </div>
          <div className="text-xs text-textTertiary">{row.original.email}</div>
        </button>
      ),
    },
    {
      accessorKey: "userRoles",
      header: "Rôle",
      cell: ({ row }) => <span className="text-xs">{row.original.userRoles.map((ur) => ur.role.name).join(", ") || "USER"}</span>,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: "Inscrit le",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("fr-FR"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {can("users.suspend") && row.original.status === "ACTIVE" ? (
            <button onClick={() => suspendUser.mutate({ userId: row.original.id })} aria-label="Suspendre" className="text-textTertiary hover:text-danger">
              <ShieldOff size={14} />
            </button>
          ) : null}
          {can("users.suspend") && row.original.status === "SUSPENDED" ? (
            <button onClick={() => reactivateUser.mutate({ userId: row.original.id })} aria-label="Réactiver" className="text-textTertiary hover:text-success">
              <ShieldCheck size={14} />
            </button>
          ) : null}
          {can("users.write") ? (
            <button
              onClick={() => resetPassword.mutate({ userId: row.original.id }, { onSuccess: () => pushToast({ variant: "success", message: "Email de réinitialisation envoyé." }) })}
              aria-label="Réinitialiser le mot de passe"
              className="text-textTertiary hover:text-primary"
            >
              <KeyRound size={14} />
            </button>
          ) : null}
          {can("users.delete") ? (
            <button onClick={() => deleteUser.mutate({ userId: row.original.id })} aria-label="Supprimer" className="text-textTertiary hover:text-danger">
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <UsersIcon className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Utilisateurs</h1>
        {data ? <span className="text-sm text-textSecondary">({data.total})</span> : null}
      </div>
      <Card>
        <DataTable columns={columns} data={data?.items ?? []} searchPlaceholder="Rechercher un utilisateur…" />
      </Card>
    </div>
  );
}

void Crown;
