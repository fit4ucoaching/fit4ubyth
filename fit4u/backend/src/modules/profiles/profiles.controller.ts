import type { Request, Response } from "express";

import { sendSuccess } from "../../utils/apiResponse";
import type { ProfilesService } from "./profiles.service";
import type {
  UpdateNotificationInput,
  UpdatePreferencesInput,
  UpdatePrivacyInput,
} from "./profiles.validators";

export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  getPreferences = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.profilesService.getPreferences(req.user!.id));
  };

  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    const result = await this.profilesService.updatePreferences(
      req.user!.id,
      req.body as UpdatePreferencesInput,
    );
    sendSuccess(res, result);
  };

  getPrivacy = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.profilesService.getPrivacy(req.user!.id));
  };

  updatePrivacy = async (req: Request, res: Response): Promise<void> => {
    const result = await this.profilesService.updatePrivacy(req.user!.id, req.body as UpdatePrivacyInput);
    sendSuccess(res, result);
  };

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.profilesService.getNotificationSettings(req.user!.id));
  };

  updateNotification = async (req: Request, res: Response): Promise<void> => {
    const result = await this.profilesService.updateNotificationSetting(
      req.user!.id,
      req.body as UpdateNotificationInput,
    );
    sendSuccess(res, result);
  };
}
