import type { Request, Response } from "express";

import { sendNoContent, sendPaginated, sendSuccess } from "../../utils/apiResponse";
import type { ExercisesService } from "./exercises.service";
import type {
  CreateExerciseInput,
  FavoriteExerciseInput,
  ListExercisesQuery,
  SearchExercisesQuery,
  UpdateExerciseInput,
} from "./exercises.validators";

export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { items, total, page, pageSize } = await this.exercisesService.list(
      req.query as unknown as ListExercisesQuery,
    );
    sendPaginated(res, items, { total, page, pageSize });
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const { items, total, page, pageSize } = await this.exercisesService.search(
      req.query as unknown as SearchExercisesQuery,
    );
    sendPaginated(res, items, { total, page, pageSize });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.exercisesService.getById(req.params.id as string));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const exercise = await this.exercisesService.create(req.body as CreateExerciseInput);
    sendSuccess(res, exercise, 201);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const exercise = await this.exercisesService.update(
      req.params.id as string,
      req.body as UpdateExerciseInput,
    );
    sendSuccess(res, exercise);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.exercisesService.remove(req.params.id as string);
    sendNoContent(res);
  };

  favorite = async (req: Request, res: Response): Promise<void> => {
    const { exerciseId } = req.body as FavoriteExerciseInput;
    const result = await this.exercisesService.toggleFavorite(req.user!.id, exerciseId);
    sendSuccess(res, result);
  };

  favorites = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.exercisesService.listFavorites(req.user!.id));
  };
}
