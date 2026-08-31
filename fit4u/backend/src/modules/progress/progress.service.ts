import { ValidationError } from "../../errors";
import type { StorageService } from "../users/storage.service";
import type { ProgressRepository } from "./progress.repository";
import type { LogMeasurementInput, LogWeightInput } from "./progress.validators";

export class ProgressService {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly storageService: StorageService,
  ) {}

  logWeight(userId: string, input: LogWeightInput) {
    return this.progressRepository.logWeight(userId, input);
  }

  logMeasurement(userId: string, input: LogMeasurementInput) {
    return this.progressRepository.logMeasurement(userId, input);
  }

  async logPhoto(userId: string, file: Express.Multer.File | undefined, angle?: string) {
    if (!file) {
      throw new ValidationError("Aucune photo reçue (champ 'photo' attendu).");
    }
    const url = await this.storageService.uploadAvatar(userId, file); // même adaptateur de stockage générique
    return this.progressRepository.logPhoto(userId, url, angle, new Date());
  }

  history(userId: string, params: { page: number; pageSize: number }) {
    return this.progressRepository.findHistory(userId, params);
  }

  analytics(userId: string) {
    return this.progressRepository.getAnalytics(userId);
  }
}
