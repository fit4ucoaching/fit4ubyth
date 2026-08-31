import { X } from "lucide-react";

import { useRightPanelStore } from "../../store/rightPanelStore";

/** Panneau latéral contextuel (Volume 6) — masqué par défaut, ouvert à la demande d'une page. */
export function RightPanel(): JSX.Element | null {
  const { isOpen, title, content, close } = useRightPanelStore();

  if (!isOpen) return null;

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-textPrimary">{title}</h2>
        <button onClick={close} aria-label="Fermer le panneau" className="text-textTertiary hover:text-textPrimary">
          <X size={16} />
        </button>
      </div>
      {content}
    </aside>
  );
}
