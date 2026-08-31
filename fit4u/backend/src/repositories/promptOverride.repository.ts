import { BaseRepository } from "./base.repository";

export class PromptOverrideRepository extends BaseRepository {
  /** Toutes les overrides actives, une par clé au plus — résolution en un seul aller-retour DB par tour Teddy. */
  findAllActive() {
    return this.db.promptOverride.findMany({ where: { isActive: true } });
  }

  findHistory(key: string) {
    return this.db.promptOverride.findMany({ where: { key: key as never }, orderBy: { version: "desc" }, include: { creator: true } });
  }

  findById(id: string) {
    return this.db.promptOverride.findUnique({ where: { id } });
  }

  async getNextVersion(key: string): Promise<number> {
    const latest = await this.db.promptOverride.findFirst({ where: { key: key as never }, orderBy: { version: "desc" } });
    return (latest?.version ?? 0) + 1;
  }

  create(data: { key: string; content: string; version: number; createdBy: string }) {
    return this.db.promptOverride.create({ data: data as never });
  }

  /** Désactive toute version active existante pour cette clé — jamais deux versions actives simultanément (contrat applicatif, voir le service). */
  deactivateAllForKey(key: string) {
    return this.db.promptOverride.updateMany({ where: { key: key as never, isActive: true }, data: { isActive: false } });
  }

  activate(id: string) {
    return this.db.promptOverride.update({ where: { id }, data: { isActive: true } });
  }

  deactivate(id: string) {
    return this.db.promptOverride.update({ where: { id }, data: { isActive: false } });
  }
}
