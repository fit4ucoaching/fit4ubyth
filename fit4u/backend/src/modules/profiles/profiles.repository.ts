import { BaseRepository } from "../../repositories/base.repository";

const DEFAULT_NOTIFICATION_TYPES = ["PUSH", "EMAIL", "IN_APP"] as const;

export class ProfilesRepository extends BaseRepository {
  async getOrCreatePreferences(userId: string) {
    const existing = await this.db.userPreference.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.db.userPreference.create({ data: { userId } });
  }

  updatePreferences(userId: string, data: Record<string, unknown>) {
    return this.db.userPreference.update({ where: { userId }, data });
  }

  async getOrCreatePrivacy(userId: string) {
    const existing = await this.db.privacySetting.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.db.privacySetting.create({ data: { userId } });
  }

  updatePrivacy(userId: string, data: Record<string, unknown>) {
    return this.db.privacySetting.update({ where: { userId }, data });
  }

  async getOrCreateNotificationSettings(userId: string) {
    const existing = await this.db.notificationSetting.findMany({ where: { userId } });
    if (existing.length > 0) return existing;

    await this.db.notificationSetting.createMany({
      data: DEFAULT_NOTIFICATION_TYPES.map((type) => ({ userId, type, isEnabled: true })),
    });
    return this.db.notificationSetting.findMany({ where: { userId } });
  }

  upsertNotificationSetting(userId: string, type: "PUSH" | "EMAIL" | "IN_APP", isEnabled: boolean) {
    return this.db.notificationSetting.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, isEnabled },
      update: { isEnabled },
    });
  }
}
