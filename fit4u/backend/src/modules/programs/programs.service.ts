import { NotFoundError } from "../../errors";
import type { ProgramsRepository } from "./programs.repository";
import type {
  CreateProgramInput,
  GenerateProgramInput,
  ListProgramsQuery,
  UpdateProgramInput,
} from "./programs.validators";

/**
 * Contrat minimal attendu du générateur IA — implémenté par `ai/ai.service.ts`
 * (Teddy). Défini ici plutôt qu'importé directement pour respecter
 * l'inversion de dépendance (Clean Architecture) : ce module ne dépend que
 * d'une interface, jamais de l'implémentation concrète du moteur IA.
 */
export interface AIProgramGenerator {
  generateWorkoutProgram(userId: string, input: GenerateProgramInput): Promise<{ aiWorkoutPlanId: string }>;
}

export class ProgramsService {
  constructor(
    private readonly programsRepository: ProgramsRepository,
    private readonly aiProgramGenerator: AIProgramGenerator,
  ) {}

  async list(query: ListProgramsQuery) {
    const { items, total } = await this.programsRepository.findMany(query);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(id: string) {
    const program = await this.programsRepository.findById(id);
    if (!program) {
      throw new NotFoundError("Programme introuvable.");
    }
    return program;
  }

  create(input: CreateProgramInput) {
    return this.programsRepository.create(input);
  }

  async update(id: string, input: UpdateProgramInput) {
    await this.getById(id);
    return this.programsRepository.update(id, input);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await this.programsRepository.softDelete(id);
  }

  /** Délègue entièrement la génération au module Teddy AI (voir `ai/ai.service.ts`). */
  generate(userId: string, input: GenerateProgramInput) {
    return this.aiProgramGenerator.generateWorkoutProgram(userId, input);
  }
}
