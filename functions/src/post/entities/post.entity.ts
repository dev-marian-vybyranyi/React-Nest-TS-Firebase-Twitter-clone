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
  likesCount?: number;
  dislikesCount?: number;
}
