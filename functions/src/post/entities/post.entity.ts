import { ReactionType } from '../../reaction/entities/reaction.entity';

export class Post {
  id: string;
  title: string;
  text: string;
  photo?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    surname: string;
    photo?: string;
  };
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
}

export type PostWithStats = Post & {
  userReaction: ReactionType | null;
};
