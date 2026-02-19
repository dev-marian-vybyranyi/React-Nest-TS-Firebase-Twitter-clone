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
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithReplies extends Comment {
  replies?: Comment[];
}
