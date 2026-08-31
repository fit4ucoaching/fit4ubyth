export type PostVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export interface AuthorSummaryDTO {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface PostDTO {
  id: string;
  author: AuthorSummaryDTO;
  content: string;
  imageUrl?: string;
  visibility: PostVisibility;
  commentsCount: number;
  likesCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  author: AuthorSummaryDTO;
  content: string;
  createdAt: string;
}

export interface GroupDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPrivate: boolean;
  membersCount: number;
}
