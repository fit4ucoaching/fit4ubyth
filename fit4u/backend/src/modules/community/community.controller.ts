import type { Request, Response } from "express";

import { sendNoContent, sendSuccess } from "../../utils/apiResponse";
import type { CommunityService } from "./community.service";
import type {
  CreateCommentInput,
  CreateGroupInput,
  CreatePostInput,
  LikeInput,
  UpdatePostInput,
} from "./community.validators";

export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  listPosts = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.communityService.posts({
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 20),
      }),
    );
  };

  createPost = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.communityService.createPost(req.user!.id, req.body as CreatePostInput), 201);
  };

  updatePost = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.communityService.updatePost(req.user!.id, req.params.id as string, req.body as UpdatePostInput),
    );
  };

  deletePost = async (req: Request, res: Response): Promise<void> => {
    await this.communityService.deletePost(req.user!.id, req.params.id as string);
    sendNoContent(res);
  };

  createComment = async (req: Request, res: Response): Promise<void> => {
    const { postId, content } = req.body as CreateCommentInput;
    sendSuccess(res, await this.communityService.addComment(req.user!.id, postId, content), 201);
  };

  toggleLike = async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.body as LikeInput;
    sendSuccess(res, await this.communityService.toggleLike(req.user!.id, postId));
  };

  listGroups = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      await this.communityService.groups({
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 20),
      }),
    );
  };

  createGroup = async (req: Request, res: Response): Promise<void> => {
    sendSuccess(res, await this.communityService.createGroup(req.user!.id, req.body as CreateGroupInput), 201);
  };
}
