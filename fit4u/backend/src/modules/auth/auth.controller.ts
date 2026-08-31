import type { Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../../utils/apiResponse";
import type { AuthService } from "./auth.service";
import type {
  AppleAuthInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.validators";

/** Ne contient aucune règle métier — parsing requête / formatage réponse uniquement. */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body as RegisterInput);
    sendSuccess(res, result, 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body as LoginInput, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    sendSuccess(res, result);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const tokens = await this.authService.refresh(req.body.refreshToken as string);
    sendSuccess(res, tokens);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logout(req.body.refreshToken as string);
    sendNoContent(res);
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    await this.authService.forgotPassword(req.body.email as string);
    sendSuccess(res, { message: "Si ce compte existe, un email a été envoyé." });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    await this.authService.resetPassword(req.body as ResetPasswordInput);
    sendSuccess(res, { message: "Mot de passe réinitialisé avec succès." });
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    await this.authService.verifyEmail(req.body.token as string);
    sendSuccess(res, { message: "Email vérifié avec succès." });
  };

  google = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.loginWithGoogle(req.body as GoogleAuthInput);
    sendSuccess(res, result);
  };

  apple = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.loginWithApple(req.body as AppleAuthInput);
    sendSuccess(res, result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getCurrentUser(req.user!.id);
    sendSuccess(res, user);
  };
}
