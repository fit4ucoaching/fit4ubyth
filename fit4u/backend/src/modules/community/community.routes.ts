import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { requireNotBanned } from "../../middleware/communityBan.middleware";
import { validateBody, validateParams, validateQuery } from "../../middleware/validation.middleware";
import { idParamSchema } from "../../validators/common.validators";
import { asyncHandler } from "../../utils/asyncHandler";
import { CommunityController } from "./community.controller";
import { CommunityRepository } from "./community.repository";
import { CommunityService } from "./community.service";
import {
  createCommentSchema,
  createGroupSchema,
  createPostSchema,
  likeSchema,
  listQuerySchema,
  updatePostSchema,
} from "./community.validators";

const communityRepository = new CommunityRepository();
const communityService = new CommunityService(communityRepository);
const communityController = new CommunityController(communityService);

export const communityRouter: Router = Router();

/** @openapi { "/posts": { get: { summary: Flux public paginé, tags: [Community], responses: { 200: { description: OK } } } } } */
communityRouter.get("/posts", validateQuery(listQuerySchema), asyncHandler(communityController.listPosts));

/** @openapi { "/posts": { post: { summary: Publie un post, tags: [Community], responses: { 201: { description: OK } } } } } */
communityRouter.post(
  "/posts",
  requireAuth,
  requireNotBanned,
  validateBody(createPostSchema),
  asyncHandler(communityController.createPost),
);

/** @openapi { "/posts/{id}": { put: { summary: Modifie son propre post, tags: [Community], responses: { 200: { description: OK } } } } } */
communityRouter.put(
  "/posts/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updatePostSchema),
  asyncHandler(communityController.updatePost),
);

/** @openapi { "/posts/{id}": { delete: { summary: Supprime son propre post, tags: [Community], responses: { 204: { description: OK } } } } } */
communityRouter.delete(
  "/posts/:id",
  requireAuth,
  validateParams(idParamSchema),
  asyncHandler(communityController.deletePost),
);

/** @openapi { "/comments": { post: { summary: Commente un post, tags: [Community], responses: { 201: { description: OK } } } } } */
communityRouter.post(
  "/comments",
  requireAuth,
  requireNotBanned,
  validateBody(createCommentSchema),
  asyncHandler(communityController.createComment),
);

/** @openapi { "/likes": { post: { summary: Like/unlike un post (toggle), tags: [Community], responses: { 200: { description: OK } } } } } */
communityRouter.post("/likes", requireAuth, validateBody(likeSchema), asyncHandler(communityController.toggleLike));

/** @openapi { "/groups": { get: { summary: Liste paginée des groupes publics, tags: [Community], responses: { 200: { description: OK } } } } } */
communityRouter.get("/groups", validateQuery(listQuerySchema), asyncHandler(communityController.listGroups));

/** @openapi { "/groups": { post: { summary: Crée un groupe (créateur = OWNER), tags: [Community], responses: { 201: { description: OK } } } } } */
communityRouter.post(
  "/groups",
  requireAuth,
  validateBody(createGroupSchema),
  asyncHandler(communityController.createGroup),
);
