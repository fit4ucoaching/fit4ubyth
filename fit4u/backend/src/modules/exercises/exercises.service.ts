import { NotFoundError } from "../../errors";
import type { ExercisesRepository } from "./exercises.repository";
import type {
  CreateExerciseInput,
  ListExercisesQuery,
  SearchExercisesQuery,
  UpdateExerciseInput,
} from "./exercises.validators";

export class ExercisesService {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async list(query: ListExercisesQuery) {
    const { items, total } = await this.exercisesRepository.findMany(query);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async search(query: SearchExercisesQuery) {
    const { items, total } = await this.exercisesRepository.search(query.q, query);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(id: string) {
    const exercise = await this.exercisesRepository.findById(id);
    if (!exercise) {
      throw new NotFoundError("Exercice introuvable.");
    }
    return exercise;
  }

  create(input: CreateExerciseInput) {
    return this.exercisesRepository.create(input);
  }

  async update(id: string, input: UpdateExerciseInput) {
    await this.getById(id); // 404 si absent
    return this.exercisesRepository.update(id, input);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.exercisesRepository.softDelete(id);
  }

  async toggleFavorite(userId: string, exerciseId: string) {
    await this.getById(exerciseId); // 404 si l'exercice n'existe pas
    return this.exercisesRepository.toggleFavorite(userId, exerciseId);
  }

  listFavorites(userId: string) {
    return this.exercisesRepository.listFavorites(userId);
  }
}
