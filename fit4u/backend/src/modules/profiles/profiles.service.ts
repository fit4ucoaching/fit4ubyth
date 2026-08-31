import type { ProfilesRepository } from "./profiles.repository";
import type {
  UpdateNotificationInput,
  UpdatePreferencesInput,
  UpdatePrivacyInput,
} from "./profiles.validators";

export class ProfilesService {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  getPreferences(userId: string) {
    return this.profilesRepository.getOrCreatePreferences(userId);
  }

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    await this.profilesRepository.getOrCreatePreferences(userId);
    return this.profilesRepository.updatePreferences(userId, input);
  }

  getPrivacy(userId: string) {
    return this.profilesRepository.getOrCreatePrivacy(userId);
  }

  async updatePrivacy(userId: string, input: UpdatePrivacyInput) {
    await this.profilesRepository.getOrCreatePrivacy(userId);
    return this.profilesRepository.updatePrivacy(userId, input);
  }

  getNotificationSettings(userId: string) {
    return this.profilesRepository.getOrCreateNotificationSettings(userId);
  }

  updateNotificationSetting(userId: string, input: UpdateNotificationInput) {
    return this.profilesRepository.upsertNotificationSetting(userId, input.type, input.isEnabled);
  }
}
