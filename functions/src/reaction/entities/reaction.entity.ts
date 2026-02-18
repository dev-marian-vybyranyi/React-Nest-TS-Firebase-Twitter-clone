export type ReactionType = 'like' | 'dislike';

export class ReactionEntity {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
}
