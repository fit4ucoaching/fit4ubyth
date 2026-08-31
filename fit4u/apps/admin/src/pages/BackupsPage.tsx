import { Database, RefreshCw } from "lucide-react";

import { Badge, Button, Card } from "../components/ui";
import { useBackupHistory, useTriggerBackup } from "../services/useBackups";
import { useUiStore } from "../store/uiStore";

const STATUS_VARIANT: Record<string, "success" | "danger" | "neutral"> = {
  completed: "success", failed: "danger", pending: "neutral",
};

/**
 * Module Sauvegardes (Volume 6). Déclenche `backupQueue` (Volume 3,
 * planifiée par ailleurs quotidiennement à 03h00 UTC). La restauration
 * réelle depuis un snapshot dépend du provider d'infrastructure — non
 * pilotable depuis cette interface (voir avertissement affiché).
 */
export function BackupsPage(): JSX.Element {
  const { data: history } = useBackupHistory();
  const triggerBackup = useTriggerBackup();
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-textPrimary">Sauvegardes</h1>
        </div>
        <Button
          isLoading={triggerBackup.isPending}
          onClick={() =>
            triggerBackup.mutate(undefined, {
              onSuccess: () => pushToast({ variant: "success", message: "Sauvegarde déclenchée." }),
            })
          }
        >
          <RefreshCw size={16} className="mr-2" /> Déclencher une sauvegarde
        </Button>
      </div>

      <p className="text-xs text-textTertiary">
        La restauration depuis un snapshot dépend du provider d'infrastructure (RDS/GCS) et n'est
        pas pilotable depuis cette interface — voir <code>docs/Modules.md</code>.
      </p>

      <Card>
        <div className="space-y-2">
          {(history ?? []).map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <span className="text-sm text-textPrimary">Job #{job.id}</span>
              <span className="text-xs text-textSecondary">{new Date(job.triggeredAt).toLocaleString("fr-FR")}</span>
              <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
            </div>
          ))}
          {(history ?? []).length === 0 ? <p className="text-sm text-textTertiary">Aucune sauvegarde récente.</p> : null}
        </div>
      </Card>
    </div>
  );
}
