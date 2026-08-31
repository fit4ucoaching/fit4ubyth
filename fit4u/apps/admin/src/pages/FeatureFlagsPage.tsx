import { useState } from "react";
import { Flag, Plus } from "lucide-react";

import { Badge, Button, Card, Input } from "../components/ui";
import { useFeatureFlagsList, useUpsertFeatureFlag, type FeatureFlagRow } from "../services/useFeatureFlags";

const AUDIENCE_LABEL: Record<FeatureFlagRow["targetAudience"], string> = {
  ALL: "Tous", PREMIUM: "Premium", VIP: "VIP", BETA: "Bêta",
};

/**
 * Feature Flags avec ciblage (Volume 6 : "Cibler Tous/Premium/VIP/Pays/
 * Version/Bêta, déploiement progressif"). Page dédiée séparée du panneau
 * Paramètres général (`SettingsPage`) pour donner la place nécessaire au
 * formulaire de ciblage complet.
 */
export function FeatureFlagsPage(): JSX.Element {
  const { data: flags } = useFeatureFlagsList();
  const upsertFlag = useUpsertFeatureFlag();
  const [newKey, setNewKey] = useState("");

  const toggleEnabled = (flag: FeatureFlagRow): void => {
    upsertFlag.mutate({ ...flag, isEnabled: !flag.isEnabled });
  };

  const updateRollout = (flag: FeatureFlagRow, rolloutPercentage: number): void => {
    upsertFlag.mutate({ ...flag, rolloutPercentage });
  };

  const updateAudience = (flag: FeatureFlagRow, targetAudience: FeatureFlagRow["targetAudience"]): void => {
    upsertFlag.mutate({ ...flag, targetAudience });
  };

  const createFlag = (): void => {
    if (!newKey.trim()) return;
    upsertFlag.mutate(
      { key: newKey.trim(), isEnabled: false, rolloutPercentage: 0, description: null, targetAudience: "ALL", targetCountries: [], targetMinVersion: null, isBeta: false },
      { onSuccess: () => setNewKey("") },
    );
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Flag className="text-primary" size={24} />
        <h1 className="text-2xl font-bold text-textPrimary">Feature Flags</h1>
      </div>

      <Card>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input label="Nouvelle clé de flag" placeholder="ex. new_onboarding_flow" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          </div>
          <Button onClick={createFlag} isLoading={upsertFlag.isPending}>
            <Plus size={16} className="mr-2" /> Créer
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {(flags ?? []).map((flag) => (
          <Card key={flag.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-textPrimary">{flag.key}</p>
                {flag.description ? <p className="text-xs text-textSecondary">{flag.description}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                {flag.isBeta ? <Badge variant="primary">Bêta</Badge> : null}
                <select
                  value={flag.targetAudience}
                  onChange={(e) => updateAudience(flag, e.target.value as FeatureFlagRow["targetAudience"])}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs text-textPrimary"
                  aria-label={`Audience ciblée pour ${flag.key}`}
                >
                  {Object.entries(AUDIENCE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={flag.rolloutPercentage}
                    onChange={(e) => updateRollout(flag, Number(e.target.value))}
                    className="w-24"
                    aria-label={`Pourcentage de déploiement pour ${flag.key}`}
                  />
                  <span className="w-10 text-xs text-textSecondary">{flag.rolloutPercentage}%</span>
                </div>
                <button
                  onClick={() => toggleEnabled(flag)}
                  className={`h-6 w-11 rounded-full transition-colors ${flag.isEnabled ? "bg-primary" : "bg-surface"}`}
                  aria-label={`${flag.isEnabled ? "Désactiver" : "Activer"} ${flag.key}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${flag.isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
