import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "../../config/env";

/**
 * Adaptateur de stockage fichiers (avatars). Implémentation disque local
 * pour le développement — à remplacer en production par un adaptateur S3 /
 * Cloudinary implémentant la même interface `uploadAvatar()`, sans impact
 * sur `users.service.ts` (principe d'inversion de dépendance).
 */
export interface StorageService {
  uploadAvatar(userId: string, file: Express.Multer.File): Promise<string>;
}

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "avatars");

export const localStorageService: StorageService = {
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const extension = path.extname(file.originalname) || ".jpg";
    const filename = `${userId}-${randomUUID()}${extension}`;
    await writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    return `${env.APP_URL}/uploads/avatars/${filename}`;
  },
};
