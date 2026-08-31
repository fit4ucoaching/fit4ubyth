import type { Request, Response } from "express";

import { ValidationError } from "../errors";
import { sendSuccess } from "../utils/apiResponse";
import type { AIService } from "./ai.service";
import type {
  AnalyzeProgressInput,
  ChatInput,
  GenerateChallengeInput,
  GenerateNutritionInput,
  GenerateWorkoutInput,
} from "./ai.validators";

export class AIController {
  constructor(private readonly aiService: AIService) {}

  chat = async (req: Request, res: Response): Promise<void> => {
    const result = await this.aiService.chat(req.user!.id, req.body as ChatInput);
    sendSuccess(res, result);
  };

  voice = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ValidationError("Aucun fichier audio reçu (champ 'audio' attendu).");
    }
    const result = await this.aiService.voice(
      req.user!.id,
      req.file,
      req.body.conversationId as string | undefined,
    );
    sendSuccess(res, result);
  };

  generateWorkout = async (req: Request, res: Response): Promise<void> => {
    const result = await this.aiService.generateWorkoutProgram(
      req.user!.id,
      req.body as GenerateWorkoutInput,
    );
    sendSuccess(res, result, 201);
  };

  generateNutrition = async (req: Request, res: Response): Promise<void> => {
    const result = await this.aiService.generateNutritionPlan(
      req.user!.id,
      req.body as GenerateNutritionInput,
    );
    sendSuccess(res, result, 201);
  };

  analyzeProgress = async (req: Request, res: Response): Promise<void> => {
    const result = await this.aiService.analyzeProgress(
      req.user!.id,
      req.body as AnalyzeProgressInput,
    );
    sendSuccess(res, result, 201);
  };

  challenge = async (req: Request, res: Response): Promise<void> => {
    const result = await this.aiService.generateChallenge(
      req.user!.id,
      req.body as GenerateChallengeInput,
    );
    sendSuccess(res, result, 201);
  };
}
