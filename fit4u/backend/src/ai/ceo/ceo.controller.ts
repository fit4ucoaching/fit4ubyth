import type { Request, Response } from "express";
import { z } from "zod";

import { sendSuccess } from "../../utils/apiResponse";
import type { CeoService } from "./ceo.service";

export const ceoChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
});

export class CeoController {
  constructor(private readonly service: CeoService) {}

  chat = async (req: Request, res: Response): Promise<void> => {
    const { conversationId, message } = req.body as z.infer<typeof ceoChatSchema>;
    sendSuccess(res, await this.service.chat(req.user!.id, conversationId, message));
  };
}
