import { NotFoundError } from "../../errors";
import type { UsersRepository } from "./users.repository";
import type { StorageService } from "./storage.service";
import type { UpdateProfileInput } from "./users.validators";

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.findFullProfile(userId);
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable.");
    }
    return user;
  }

  async updateMe(userId: string, input: UpdateProfileInput) {
    const { locale, ...profileFields } = input;

    if (Object.keys(profileFields).length > 0) {
      await this.usersRepository.updateProfile(userId, profileFields);
    }
    if (locale) {
      await this.usersRepository.updateLocale(userId, locale);
    }

    return this.getMe(userId);
  }

  async deleteMe(userId: string): Promise<void> {
    await this.usersRepository.softDeleteAccount(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.storageService.uploadAvatar(userId, file);
    await this.usersRepository.updateAvatar(userId, avatarUrl);
    return { avatarUrl };
  }

  getStatistics(userId: string) {
    return this.usersRepository.getStatistics(userId);
  }
}
