import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, ToggleLeft, ToggleRight } from "lucide-react";

import { Card, CardHeader, CardTitle } from "../components/ui";
import { apiClient } from "../services/apiClient";

interface FeatureFlag {
  id: string;
  key: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  description?: string;
}

/** Module Paramètres (Volume 4) — feature flags connectés à `/admin/feature-flags` (Volume 3, réel). */
export function SettingsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { data: flags } = useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: () => apiClient.get<FeatureFlag[]>("/admin/feature-flags"),
  });

  const toggleFlag = useMutation({
    mutationFn: (flag: FeatureFlag) =>
      apiClient.put("/admin/feature-flags", { key: flag.key, isEnabled: !flag.isEnabled, rolloutPercentage: flag.rolloutPercentage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Paramètres</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Feature flags</CardTitle></CardHeader>
        <div className="space-y-2">
          {(flags ?? []).map((flag) => (
            <button
              key={flag.id}
              onClick={() => toggleFlag.mutate(flag)}
              className="flex w-full items-center justify-between rounded-md border border-border p-3 text-left hover:bg-surface"
            >
              <div>
                <p className="text-sm font-medium text-textPrimary">{flag.key}</p>
                {flag.description ? <p className="text-xs text-textSecondary">{flag.description}</p> : null}
              </div>
              {flag.isEnabled ? <ToggleRight className="text-primary" /> : <ToggleLeft className="text-textTertiary" />}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
