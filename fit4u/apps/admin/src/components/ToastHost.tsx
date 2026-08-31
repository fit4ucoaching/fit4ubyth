import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { useEffect } from "react";

import { useUiStore, type Toast } from "../store/uiStore";

const ICONS = { success: CheckCircle2, error: XCircle, warning: TriangleAlert, info: Info } as const;
const COLORS = { success: "#2ECC71", error: "#E74C3C", warning: "#F1C40F", info: "#3B9EFF" } as const;
const AUTO_DISMISS_MS = 3500;

function ToastItem({ toast }: { toast: Toast }): JSX.Element {
  const dismissToast = useUiStore((s) => s.dismissToast);
  const Icon = ICONS[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismissToast]);

  return (
    <div
      role="alert"
      onClick={() => dismissToast(toast.id)}
      className="flex cursor-pointer items-center gap-3 rounded-lg bg-surfaceElevated px-4 py-3 shadow-lg"
    >
      <Icon size={18} color={COLORS[toast.variant]} />
      <span className="text-sm text-textPrimary">{toast.message}</span>
    </div>
  );
}

/** Hôte de toasts global admin — transitions CSS simples (pas de dépendance animation supplémentaire). */
export function ToastHost(): JSX.Element {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
