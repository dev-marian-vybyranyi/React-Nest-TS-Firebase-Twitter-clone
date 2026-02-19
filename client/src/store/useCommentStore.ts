import { create } from "zustand";
import { api } from "@/api/axios";
import type { Comment } from "@/types/comment";

interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;

  fetchComments: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    authorId: string,
    authorUsername: string,
    authorPhotoURL: string | null,
    content: string,
    parentId?: string,
  ) => Promise<void>;
  deleteComment: (commentId: string, requesterId: string) => Promise<void>;
  updateComment: (
    commentId: string,
    requesterId: string,
    content: string,
  ) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<{ docs: Comment[] }>(
        `/comment/${postId}?limit=10`,
      );
      set({ comments: response.data.docs, loading: false });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to fetch comments",
      });
    }
  },

  addComment: async (
    postId,
    authorId,
    authorUsername,
    authorPhotoURL,
    content,
    parentId,
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<Comment>("/comment", {
        postId,
        authorId,
        authorUsername,
        authorPhotoURL,
        content,
        parentId,
      });

      const newComment = response.data;

      set((state) => ({
        comments: [newComment, ...state.comments],
        loading: false,
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to add comment",
      });
      throw error;
    }
  },

  deleteComment: async (commentId, requesterId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/comment/${commentId}`, {
        data: { requesterId },
      });

      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
        loading: false,
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to delete comment",
      });
      throw error;
    }
  },

  updateComment: async (commentId, requesterId, content) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/comment/${commentId}`, {
        requesterId,
        content,
      });

      set((state) => ({
        comments: state.comments.map((c) =>
          c.id === commentId ? { ...c, content } : c,
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to update comment",
      });
      throw error;
    }
  },
}));
