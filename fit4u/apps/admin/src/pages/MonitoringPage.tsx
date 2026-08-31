import { useQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardHeader, CardTitle } from "../components/ui";

interface ReadinessResponse {
  status: string;
  checks: Record<string, "ok" | "error">;
}

/**
 * Module Monitoring (Volume 4) — interroge directement `/health/ready`
 * (hors `/api/v1`, Volume 3) plutôt que `/metrics` (format Prometheus texte,
 * destiné à un scraper externe comme Grafana, pas à cette UI).
 */
export function MonitoringPage(): JSX.Element {
  const apiOrigin = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1").replace(/\/api\/v1$/, "");

  const { data } = useQuery({
    queryKey: ["admin", "monitoring", "readiness"],
    queryFn: async () => {
      const res = await fetch(`${apiOrigin}/health/ready`);
      return (await res.json()).data as ReadinessResponse;
    },
    refetchInterval: 15_000,
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Activity className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Monitoring</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>État des dépendances</CardTitle></CardHeader>
        <div className="space-y-2">
          {Object.entries(data?.checks ?? {}).map(([name, status]) => (
            <div key={name} className="flex items-center justify-between rounded-md border border-border p-3">
              <span className="text-sm capitalize text-textPrimary">{name}</span>
              {status === "ok" ? <CheckCircle2 className="text-success" size={18} /> : <XCircle className="text-danger" size={18} />}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-textTertiary">
          Métriques Prometheus détaillées disponibles sur <code>/metrics</code>, à connecter à Grafana/Datadog en production.
        </p>
      </Card>
    </div>
  );
}
