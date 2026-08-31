import { useState } from "react";
import { Ban, Check, ShieldAlert, Users, X } from "lucide-react";

import { Badge, Card } from "../components/ui";
import { useBansList, useLiftBan, useReportsList, useReviewReport } from "../services/useAdminCommunity";
import { useUiStore } from "../store/uiStore";

const STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  PENDING: "neutral", REVIEWED: "neutral", DISMISSED: "success", ACTIONED: "danger",
};

const TARGET_LABEL: Record<string, string> = { POST: "Publication", COMMENT: "Commentaire", USER: "Utilisateur" };

/**
 * Centre de modération (Volume 6, gap comblé) — Signalements et
 * Bannissements. "ACTIONED" retire réellement le contenu côté serveur
 * (pas seulement un changement de statut visuel).
 */
export function CommunityPage(): JSX.Element {
  const [tab, setTab] = useState<"reports" | "bans">("reports");
  const pushToast = useUiStore((s) => s.pushToast);

  const { data: reports } = useReportsList({ page: 1, pageSize: 50, status: "PENDING" });
  const reviewReport = useReviewReport();
  const { data: bans } = useBansList({ page: 1, pageSize: 50, activeOnly: true });
  const liftBan = useLiftBan();

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Users className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Communauté</h1>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab("reports")} className={`px-4 py-2 text-sm font-medium ${tab === "reports" ? "border-b-2 border-primary text-primary" : "text-textSecondary"}`}>
          Signalements en attente ({reports?.total ?? 0})
        </button>
        <button onClick={() => setTab("bans")} className={`px-4 py-2 text-sm font-medium ${tab === "bans" ? "border-b-2 border-primary text-primary" : "text-textSecondary"}`}>
          Bannissements actifs ({bans?.total ?? 0})
        </button>
      </div>

      {tab === "reports" ? (
        <Card>
          <div className="divide-y divide-border">
            {(reports?.items ?? []).map((report) => (
              <div key={report.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={18} className="text-warning" />
                  <div>
                    <p className="text-sm font-medium text-textPrimary">
                      <Badge variant="neutral">{TARGET_LABEL[report.targetType]}</Badge> signalé par {report.reporter.email}
                    </p>
                    <p className="text-xs text-textSecondary">{report.reason}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => reviewReport.mutate({ id: report.id, status: "DISMISSED" }, { onSuccess: () => pushToast({ variant: "success", message: "Signalement rejeté." }) })}
                    className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-textSecondary hover:bg-surface"
                  >
                    <X size={14} /> Rejeter
                  </button>
                  <button
                    onClick={() => reviewReport.mutate({ id: report.id, status: "ACTIONED" }, { onSuccess: () => pushToast({ variant: "success", message: "Contenu retiré." }) })}
                    className="flex items-center gap-1 rounded-md bg-danger px-3 py-1.5 text-xs text-white hover:opacity-90"
                  >
                    <Check size={14} /> Retirer le contenu
                  </button>
                </div>
              </div>
            ))}
            {(reports?.items ?? []).length === 0 ? <p className="py-4 text-sm text-textTertiary">Aucun signalement en attente.</p> : null}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {(bans?.items ?? []).map((ban) => (
              <div key={ban.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Ban size={18} className="text-danger" />
                  <div>
                    <p className="text-sm font-medium text-textPrimary">
                      {ban.user.profile ? `${ban.user.profile.firstName} ${ban.user.profile.lastName}` : ban.user.email}
                    </p>
                    <p className="text-xs text-textSecondary">
                      {ban.reason} · {ban.expiresAt ? `jusqu'au ${new Date(ban.expiresAt).toLocaleDateString("fr-FR")}` : "permanent"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => liftBan.mutate(ban.id, { onSuccess: () => pushToast({ variant: "success", message: "Bannissement levé." }) })}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-textPrimary hover:bg-surface"
                >
                  Lever le bannissement
                </button>
              </div>
            ))}
            {(bans?.items ?? []).length === 0 ? <p className="py-4 text-sm text-textTertiary">Aucun bannissement actif.</p> : null}
          </div>
          <p className="mt-3 text-xs text-textTertiary">
            L'octroi d'un nouveau bannissement se fait depuis la fiche utilisateur (accessible via
            le module Utilisateurs) — évite un champ de saisie libre d'ID utilisateur ici.
          </p>
        </Card>
      )}
    </div>
  );
}
