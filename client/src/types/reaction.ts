export type ReactionType = "like" | "dislike" | null;

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
}

export interface PostReaction {
  userReaction: ReactionType;
  likes: number;
  dislikes: number;
  commentsCount?: number;
}
