export interface Post {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  photo?: string;
  title?: string;
  user?: {
    name: string;
    surname: string;
    photo?: string;
  };
}

export interface PostsResponse {
  posts: Post[];
  lastDocId: string | null;
  hasMore: boolean;
}
