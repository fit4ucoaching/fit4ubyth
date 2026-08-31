import { Construction } from "lucide-react";

/**
 * Page de réserve pour les modules dont le backend Volume 3 n'expose pas
 * encore d'endpoint dédié (Teddy, Nutrition, Boutique, Paiements — vue
 * globale, Sauvegardes). Volontairement honnête plutôt que de simuler des
 * données : voir docs/FRONTEND_ARCHITECTURE.md pour le détail des endpoints
 * à ajouter par module.
 */
export function ComingSoonPage({ title }: { title: string }): JSX.Element {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <Construction className="text-textTertiary" size={32} />
      <h1 className="text-xl font-bold text-textPrimary">{title}</h1>
      <p className="max-w-sm text-sm text-textSecondary">
        Ce module nécessite un endpoint backend dédié non encore exposé par le Volume 3.
        L'interface suivra le même pattern que VIP/Support une fois disponible.
      </p>
    </div>
  );
}
