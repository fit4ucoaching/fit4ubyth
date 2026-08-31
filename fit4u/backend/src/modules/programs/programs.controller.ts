import type { Request, Response } from "express";

import { sendNoContent, sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { ProgramsService } from "./programs.service";
import type {
  CreateProgramInput,
  GenerateProgramInput,
  ListProgramsQuery,
  UpdateProgramInput,
} from "./programs.validators";

export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { items, total, page, pageSize } = await this.programsService.list(
      req.query as unknown as ListProgramsQuery,
    );
    sendPaginated(res, items, { total, page, pageSize });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.programsService.getById(req.params.id as string));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.programsService.create(req.body as CreateProgramInput), 201);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.programsService.update(req.params.id as string, req.body as UpdateProgramInput),
    );
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.programsService.remove(req.params.id as string);
    sendNoContent(res);
  };

  generate = async (req: Request, res: Response): Promise<void> => {
    const result = await this.programsService.generate(req.user!.id, req.body as GenerateProgramInput);
    sendSuccess(res, result, 201);
  };
}
