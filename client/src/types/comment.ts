export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorPhotoURL: string | null;
  content: string;
  parentId: string | null;
  replyCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithReplies extends Comment {
  replies?: Comment[];
}
