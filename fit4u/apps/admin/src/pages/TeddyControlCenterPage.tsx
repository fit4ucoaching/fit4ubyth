import { useState } from "react";
import { CheckCircle2, History, PlayCircle, Sparkles } from "lucide-react";

import { Badge, Button, Card } from "../components/ui";
import {
  useActivatePromptVersion, useCreatePromptVersion, useDeactivatePromptVersion,
  usePreviewPrompt, usePromptHistory, type PromptKey,
} from "../services/useTeddyControlCenter";
import { useUiStore } from "../store/uiStore";

const DOMAIN_LABELS: Record<PromptKey, string> = {
  COACH: "Coach (entraînement)", NUTRITION: "Nutrition", RECOVERY: "Récupération",
  MOTIVATION: "Motivation", ANALYTICS: "Analyse de progression", PLANNER: "Planning",
};

/**
 * Teddy Control Center (décision d'architecture tranchée par comparaison
 * avec Intercom Fin/Zendesk AI) — édite UNIQUEMENT les Domain Prompts
 * (ton/style métier). L'identité et la sécurité globale de Teddy ne sont
 * JAMAIS éditables ici, intentionnellement : ce sont des constantes
 * TypeScript versionnées par Git, pas un risque exposé au BackOffice.
 */
export function TeddyControlCenterPage(): JSX.Element {
  const [selectedKey, setSelectedKey] = useState<PromptKey>("COACH");
  const [draftContent, setDraftContent] = useState("");
  const [sampleMessage, setSampleMessage] = useState("Peux-tu me proposer une séance pour aujourd'hui ?");
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const { data: history } = usePromptHistory(selectedKey);
  const createVersion = useCreatePromptVersion();
  const activateVersion = useActivatePromptVersion();
  const deactivateVersion = useDeactivatePromptVersion();
  const previewPrompt = usePreviewPrompt();
  const pushToast = useUiStore((s) => s.pushToast);

  const activeVersion = history?.find((v) => v.isActive);

  const handlePreview = (): void => {
    if (!draftContent.trim()) return;
    previewPrompt.mutate(
      { content: draftContent, sampleMessage },
      { onSuccess: (result) => setPreviewResult(result.response), onError: () => pushToast({ variant: "error", message: "Aperçu impossible." }) },
    );
  };

  const handleSaveVersion = (): void => {
    if (!draftContent.trim()) return;
    createVersion.mutate(
      { key: selectedKey, content: draftContent },
      { onSuccess: () => { setDraftContent(""); setPreviewResult(null); pushToast({ variant: "success", message: "Nouvelle version créée (inactive) — testez-la avant de la déployer." }); } },
    );
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Teddy Control Center</h1>
          <p className="text-xs text-textSecondary">Édite le TON de Teddy par domaine — jamais son identité ni ses garde-fous de sécurité</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(DOMAIN_LABELS) as PromptKey[]).map((key) => (
          <button
            key={key}
            onClick={() => { setSelectedKey(key); setDraftContent(""); setPreviewResult(null); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${selectedKey === key ? "bg-primary text-white" : "border border-border text-textSecondary hover:bg-surface"}`}
          >
            {DOMAIN_LABELS[key]}
          </button>
        ))}
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-textPrimary">Version active — {DOMAIN_LABELS[selectedKey]}</h2>
          {activeVersion ? <Badge variant="success">v{activeVersion.version}</Badge> : <Badge variant="neutral">Aucune (comportement par défaut)</Badge>}
        </div>
        {activeVersion ? (
          <p className="whitespace-pre-wrap rounded-md bg-background p-3 text-sm text-textSecondary">{activeVersion.content}</p>
        ) : (
          <p className="text-sm text-textTertiary">
            Aucun override actif — Teddy utilise le Domain Prompt codé en dur pour ce domaine.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-textPrimary">Nouvelle version</h2>
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Rédigez le nouveau ton/style pour ce domaine…"
          rows={5}
          className="w-full rounded-md border border-border bg-background p-3 text-sm text-textPrimary"
        />

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label className="mb-1 block text-xs text-textSecondary">Message d'exemple pour l'aperçu</label>
            <input
              value={sampleMessage}
              onChange={(e) => setSampleMessage(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-textPrimary"
            />
          </div>
          <Button variant="outline" onClick={handlePreview} isLoading={previewPrompt.isPending} disabled={!draftContent.trim()}>
            <PlayCircle size={16} className="mr-2" /> Tester
          </Button>
          <Button onClick={handleSaveVersion} isLoading={createVersion.isPending} disabled={!draftContent.trim()}>
            Enregistrer la version
          </Button>
        </div>

        {previewResult ? (
          <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="mb-1 text-xs font-medium text-primary">Réponse simulée de Teddy avec ce prompt :</p>
            <p className="text-sm text-textPrimary">{previewResult}</p>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-textTertiary">
          L'aperçu simule une réponse isolée (identité + sécurité + ce prompt), sans la mémoire
          complète d'un utilisateur réel — utile pour juger le TON, pas un test de bout en bout.
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-textPrimary">
          <History size={16} /> Historique des versions
        </h2>
        <div className="divide-y divide-border">
          {(history ?? []).map((v) => (
            <div key={v.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-textPrimary">
                  v{v.version} {v.isActive ? <CheckCircle2 size={14} className="ml-1 inline text-success" /> : null}
                </p>
                <p className="text-xs text-textTertiary">Créée par {v.creator.email} le {new Date(v.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              {v.isActive ? (
                <button onClick={() => deactivateVersion.mutate(v.id)} className="rounded-md border border-border px-3 py-1.5 text-xs text-textPrimary hover:bg-surface">
                  Désactiver (rollback)
                </button>
              ) : (
                <button onClick={() => activateVersion.mutate(v.id)} className="rounded-md bg-primary px-3 py-1.5 text-xs text-white hover:opacity-90">
                  Déployer cette version
                </button>
              )}
            </div>
          ))}
          {(history ?? []).length === 0 ? <p className="py-4 text-sm text-textTertiary">Aucune version créée pour ce domaine.</p> : null}
        </div>
      </Card>
    </div>
  );
}
