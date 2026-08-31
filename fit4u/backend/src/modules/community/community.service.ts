import { AuthorizationError, NotFoundError } from "../../errors";
import { getSocketServer } from "../../websocket";
import type { CommunityRepository } from "./community.repository";
import type { CreateGroupInput, CreatePostInput, UpdatePostInput } from "./community.validators";

export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  posts(params: { page: number; pageSize: number }) {
    return this.communityRepository.findPosts(params);
  }

  createPost(userId: string, input: CreatePostInput) {
    return this.communityRepository.createPost(userId, input);
  }

  private async assertPostOwnership(id: string, userId: string) {
    const post = await this.communityRepository.findPostById(id);
    if (!post) throw new NotFoundError("Publication introuvable.");
    if (post.userId !== userId) throw new AuthorizationError("Cette publication ne vous appartient pas.");
    return post;
  }

  async updatePost(userId: string, id: string, input: UpdatePostInput) {
    await this.assertPostOwnership(id, userId);
    return this.communityRepository.updatePost(id, input);
  }

  async deletePost(userId: string, id: string): Promise<void> {
    await this.assertPostOwnership(id, userId);
    await this.communityRepository.softDeletePost(id);
  }

  async addComment(userId: string, postId: string, content: string) {
    const post = await this.communityRepository.findPostById(postId);
    if (!post) throw new NotFoundError("Publication introuvable.");

    const comment = await this.communityRepository.createComment(userId, postId, content);
    getSocketServer()?.emit("community:new-comment", { postId, comment });
    return comment;
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.communityRepository.findPostById(postId);
    if (!post) throw new NotFoundError("Publication introuvable.");

    const result = await this.communityRepository.toggleLike(userId, postId);
    getSocketServer()?.emit("community:like-changed", { postId, ...result });
    return result;
  }

  groups(params: { page: number; pageSize: number }) {
    return this.communityRepository.findGroups(params);
  }

  createGroup(userId: string, input: CreateGroupInput) {
    return this.communityRepository.createGroup(userId, input);
  }
}
