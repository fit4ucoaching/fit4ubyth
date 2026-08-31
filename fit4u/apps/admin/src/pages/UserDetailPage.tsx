import { ArrowLeft, Crown, Dumbbell, MessageSquare, Package, ScrollText, Target, TrendingUp } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import { Badge, Card, CardHeader, CardTitle } from "../components/ui";
import { usePermissions } from "../hooks/usePermissions";
import { useAdminUserDetail, useResetUserPassword, useSuspendUser, useReactivateUser } from "../services/useAdminUsers";
import { Button } from "../components/ui";
import { useUiStore } from "../store/uiStore";

interface FullProfileResponse {
  user: { id: string; email: string; status: string; createdAt: string; profile: { firstName: string; lastName: string; heightCm: number | null } | null; userRoles: { role: { name: string } }[] } | null;
  goals: { id: string; title: string; type: string }[];
  weightHistory: { id: string; weightKg: number; recordedAt: string }[];
  workoutSessions: { id: string; title: string; status: string; createdAt: string }[];
  mealPlans: { id: string; name: string }[];
  badges: { id: string; badge: { name: string } }[];
  orders: { id: string; status: string; totalCents: number; createdAt: string }[];
  payments: { id: string; status: string; amountCents: number; createdAt: string }[];
  conversations: { id: string; title: string | null; createdAt: string }[];
  adminLogs: { id: string; action: string; createdAt: string }[];
}

/**
 * Fiche utilisateur complète (Volume 6) — profil, objectifs, poids,
 * séances, nutrition, badges, commandes, paiements, conversations Teddy,
 * logs. Une seule requête groupée côté backend (`findFullProfile`).
 */
export function UserDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const pushToast = useUiStore((s) => s.pushToast);
  const { data, isLoading } = useAdminUserDetail(id) as { data: FullProfileResponse | undefined; isLoading: boolean };
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const resetPassword = useResetUserPassword();

  if (isLoading || !data?.user) {
    return <div className="p-8 text-textSecondary">Chargement…</div>;
  }

  const { user, goals, weightHistory, workoutSessions, badges, orders, payments, conversations, adminLogs } = data;

  return (
    <div className="space-y-6 p-8">
      <button onClick={() => navigate("/users")} className="flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary">
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">
            {user.profile?.firstName} {user.profile?.lastName}
          </h1>
          <p className="text-sm text-textSecondary">{user.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>{user.status}</Badge>
            {user.userRoles.map((ur) => (
              <Badge key={ur.role.name} variant="neutral">{ur.role.name}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {can("users.write") ? (
            <Button variant="outline" onClick={() => resetPassword.mutate({ userId: user.id })} isLoading={resetPassword.isPending}>
              Réinitialiser le mot de passe
            </Button>
          ) : null}
          {can("users.suspend") ? (
            user.status === "ACTIVE" ? (
              <Button
                variant="danger"
                onClick={() =>
                  suspendUser.mutate(
                    { userId: user.id },
                    { onSuccess: () => pushToast({ variant: "success", message: "Compte suspendu." }) },
                  )
                }
              >
                Suspendre
              </Button>
            ) : (
              <Button onClick={() => reactivateUser.mutate({ userId: user.id })}>Réactiver</Button>
            )
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle><Target size={16} className="mr-2 inline" />Objectifs</CardTitle></CardHeader>
          {goals.length === 0 ? <p className="text-sm text-textTertiary">Aucun objectif défini.</p> : (
            <ul className="space-y-1 text-sm text-textPrimary">
              {goals.map((g) => <li key={g.id}>{g.title} — <span className="text-textTertiary">{g.type}</span></li>)}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle><TrendingUp size={16} className="mr-2 inline" />Poids récent</CardTitle></CardHeader>
          {weightHistory.length === 0 ? <p className="text-sm text-textTertiary">Aucune donnée.</p> : (
            <ul className="space-y-1 text-sm text-textPrimary">
              {weightHistory.slice(0, 5).map((w) => (
                <li key={w.id}>{w.weightKg} kg — {new Date(w.recordedAt).toLocaleDateString("fr-FR")}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle><Dumbbell size={16} className="mr-2 inline" />Séances récentes</CardTitle></CardHeader>
          {workoutSessions.length === 0 ? <p className="text-sm text-textTertiary">Aucune séance.</p> : (
            <ul className="space-y-1 text-sm text-textPrimary">
              {workoutSessions.slice(0, 5).map((w) => (
                <li key={w.id} className="flex justify-between">
                  <span>{w.title}</span>
                  <Badge variant={w.status === "COMPLETED" ? "success" : "neutral"}>{w.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle><Crown size={16} className="mr-2 inline" />Badges</CardTitle></CardHeader>
          {badges.length === 0 ? <p className="text-sm text-textTertiary">Aucun badge.</p> : (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => <Badge key={b.id} variant="primary">{b.badge.name}</Badge>)}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle><Package size={16} className="mr-2 inline" />Commandes & paiements</CardTitle></CardHeader>
          <div className="space-y-1 text-sm text-textPrimary">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex justify-between"><span>Commande</span><span>{(o.totalCents / 100).toFixed(2)} € — {o.status}</span></div>
            ))}
            {payments.slice(0, 3).map((p) => (
              <div key={p.id} className="flex justify-between text-textSecondary"><span>Paiement</span><span>{(p.amountCents / 100).toFixed(2)} € — {p.status}</span></div>
            ))}
            {orders.length === 0 && payments.length === 0 ? <p className="text-textTertiary">Aucune transaction.</p> : null}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle><MessageSquare size={16} className="mr-2 inline" />Conversations Teddy</CardTitle></CardHeader>
          {conversations.length === 0 ? <p className="text-sm text-textTertiary">Aucune conversation.</p> : (
            <ul className="space-y-1 text-sm text-textPrimary">
              {conversations.slice(0, 5).map((c) => (
                <li key={c.id}>{c.title ?? "Conversation sans titre"} — {new Date(c.createdAt).toLocaleDateString("fr-FR")}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle><ScrollText size={16} className="mr-2 inline" />Historique des actions admin sur ce compte</CardTitle></CardHeader>
        {adminLogs.length === 0 ? <p className="text-sm text-textTertiary">Aucune action enregistrée.</p> : (
          <ul className="space-y-1 text-sm text-textPrimary">
            {adminLogs.map((log) => (
              <li key={log.id} className="flex justify-between">
                <span>{log.action}</span>
                <span className="text-textTertiary">{new Date(log.createdAt).toLocaleString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
