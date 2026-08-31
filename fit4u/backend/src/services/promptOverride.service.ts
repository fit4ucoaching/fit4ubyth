import { NotFoundError } from "../errors";
import { auditLogService } from "./auditLog.service";
import { PromptOverrideRepository } from "../repositories/promptOverride.repository";

const repository = new PromptOverrideRepository();

/**
 * Teddy Control Center (décision d'architecture tranchée en revue continue)
 * — gère les versions de Domain Prompts éditables, jamais les prompts
 * d'identité/sécurité (constantes TypeScript, non touchées par ce
 * service). Une seule version ACTIVE par clé à la fois : créer une
 * nouvelle version ne l'active pas automatiquement (permet de la tester
 * avant activation, Volume 6 : "tester des prompts... déployer").
 */
export class PromptOverrideService {
  /** Résolution consommée par `ai.service.ts` avant chaque appel Teddy — un seul aller-retour DB, jamais une requête par domaine. */
  async resolveActiveOverrides(): Promise<Partial<Record<string, string>>> {
    const active = await repository.findAllActive();
    return Object.fromEntries(active.map((o) => [o.key.toLowerCase(), o.content]));
  }

  getHistory(key: string) {
    return repository.findHistory(key);
  }

  /** Crée une nouvelle version — INACTIVE par défaut (voir `activate()` pour la déployer). */
  async createVersion(adminId: string, key: string, content: string) {
    const version = await repository.getNextVersion(key);
    const override = await repository.create({ key, content, version, createdBy: adminId });

    await auditLogService.record({
      performedBy: adminId, action: "PROMPT_OVERRIDE_CREATED", targetType: "PromptOverride", targetId: override.id,
      after: { key, version },
    });

    return override;
  }

  /** Déploiement (Volume 8 §34-36 appliqué aux prompts) — désactive l'ancienne version active AVANT d'activer la nouvelle, jamais deux actives en même temps. */
  async activate(adminId: string, id: string) {
    const override = await repository.findById(id);
    if (!override) throw new NotFoundError("Version de prompt introuvable.");

    await repository.deactivateAllForKey(override.key);
    const activated = await repository.activate(id);

    await auditLogService.record({
      performedBy: adminId, action: "PROMPT_OVERRIDE_ACTIVATED", targetType: "PromptOverride", targetId: id,
      after: { key: override.key, version: override.version },
    });

    return activated;
  }

  /** Rollback vers le comportement codé en dur (Volume 8 §35) — désactive sans réactiver automatiquement une version antérieure, choix explicite laissé à l'admin. */
  async deactivate(adminId: string, id: string) {
    const override = await repository.findById(id);
    if (!override) throw new NotFoundError("Version de prompt introuvable.");

    const deactivated = await repository.deactivate(id);

    await auditLogService.record({
      performedBy: adminId, action: "PROMPT_OVERRIDE_DEACTIVATED", targetType: "PromptOverride", targetId: id,
      before: { key: override.key, version: override.version },
    });

    return deactivated;
  }
}

export const promptOverrideService = new PromptOverrideService();
