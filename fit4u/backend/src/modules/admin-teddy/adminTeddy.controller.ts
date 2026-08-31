import type { Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/apiResponse";
import { previewDomainPrompt, promptOverrideService } from "./adminTeddy.service";
import type { CreatePromptVersionInput, PromptKeyParam } from "./adminTeddy.validators";

export const previewPromptSchema = z.object({
  content: z.string().min(10).max(4000),
  sampleMessage: z.string().min(1).max(500),
});

export class AdminTeddyController {
  getHistory = async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params as unknown as PromptKeyParam;
    sendSuccess(res, await promptOverrideService.getHistory(key));
  };

  createVersion = async (req: Request, res: Response): Promise<void> => {
    const { key, content } = req.body as CreatePromptVersionInput;
    sendSuccess(res, await promptOverrideService.createVersion(req.user!.id, key, content), 201);
  };

  activate = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await promptOverrideService.activate(req.user!.id, req.params.id as string));
  };

  deactivate = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await promptOverrideService.deactivate(req.user!.id, req.params.id as string));
  };

  preview = async (req: Request, res: Response): Promise<void> => {
    const { content, sampleMessage } = req.body as z.infer<typeof previewPromptSchema>;
    sendSuccess(res, { response: await previewDomainPrompt(content, sampleMessage) });
  };
}
