import type { Request, Response } from "express";

import { ValidationError } from "../../errors";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";
import type { UsersService } from "./users.service";
import type { UpdateProfileInput } from "./users.validators";

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.usersService.getMe(req.user!.id);
    sendSuccess(res, user);
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    const user = await this.usersService.updateMe(req.user!.id, req.body as UpdateProfileInput);
    sendSuccess(res, user);
  };

  deleteMe = async (req: Request, res: Response): Promise<void> => {
    await this.usersService.deleteMe(req.user!.id);
    sendNoContent(res);
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ValidationError("Aucun fichier reçu (champ 'avatar' attendu).");
    }
    const result = await this.usersService.uploadAvatar(req.user!.id, req.file);
    sendSuccess(res, result);
  };

  statistics = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.usersService.getStatistics(req.user!.id);
    sendSuccess(res, stats);
  };
}
