import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional(),
  visibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).default("FRIENDS"),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

export const likeSchema = z.object({
  postId: z.string().uuid(),
});

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type LikeInput = z.infer<typeof likeSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
