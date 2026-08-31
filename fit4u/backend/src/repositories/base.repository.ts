import type { PaginationParams } from "@fit4u/types";
import type { Prisma } from "@prisma/client";

import { prisma } from "../database/prisma";

/**
 * Abstraction commune aux repositories de modules — centralise la
 * pagination (curseur préférentiellement, offset en repli — voir
 * `docs/DATABASE_ARCHITECTURE.md` §6) pour ne jamais dupliquer cette
 * logique dans chaque repository de domaine.
 */
export abstract class BaseRepository {
  protected readonly db = prisma;

  protected buildOffsetPagination(params: PaginationParams): { skip: number; take: number } {
    const pageSize = Math.min(Math.max(params.pageSize, 1), 100);
    const page = Math.max(params.page, 1);
    return { skip: (page - 1) * pageSize, take: pageSize };
  }
}

/** Erreur Prisma "enregistrement non trouvé" (P2025) — utile pour mapper vers `NotFoundError`. */
export function isPrismaNotFoundError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2025"
  );
}

/** Erreur Prisma "contrainte unique violée" (P2002) — utile pour mapper vers `ConflictError`. */
export function isPrismaUniqueConstraintError(
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
