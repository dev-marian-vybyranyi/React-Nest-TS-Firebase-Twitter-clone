import { api } from "@/api/axios";
import type { Comment } from "@/types/comment";
import { create } from "zustand";
import type { AppError } from "@/types/error";

interface CommentState {
  comments: Record<string, Comment[]>;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string | null>;

  fetchComments: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    authorId: string,
    authorUsername: string,
    authorPhotoURL: string | null,
    content: string,
    parentId?: string,
  ) => Promise<void>;
  deleteComment: (
    postId: string,
    commentId: string,
    requesterId: string,
  ) => Promise<void>;
  updateComment: (
    postId: string,
    commentId: string,
    requesterId: string,
    content: string,
  ) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: {},
  loadingStates: {},
  errors: {},

  fetchComments: async (postId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [postId]: true },
      errors: { ...state.errors, [postId]: null },
    }));
    try {
      const response = await api.get<{ docs: Comment[] }>(
        `/posts/${postId}/comments?limit=10`,
      );
      set((state) => ({
        comments: { ...state.comments, [postId]: response.data.docs },
        loadingStates: { ...state.loadingStates, [postId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [postId]: false },
        errors: {
          ...state.errors,
          [postId]: error.message || "Failed to fetch comments",
        },
      }));
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
    set((state) => ({
      loadingStates: { ...state.loadingStates, [postId]: true },
      errors: { ...state.errors, [postId]: null },
    }));
    try {
      const response = await api.post<Comment>(`/posts/${postId}/comments`, {
        postId,
        authorId,
        authorUsername,
        authorPhotoURL,
        content,
        parentId,
      });

      const newComment = response.data;

      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: [newComment, ...(state.comments[postId] || [])],
        },
        loadingStates: { ...state.loadingStates, [postId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [postId]: false },
        errors: {
          ...state.errors,
          [postId]: error.message || "Failed to add comment",
        },
      }));
      throw error;
    }
  },

  deleteComment: async (postId, commentId, requesterId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [postId]: true },
      errors: { ...state.errors, [postId]: null },
    }));
    try {
      await api.delete(`/comments/${commentId}`, {
        data: { requesterId },
      });

      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).filter(
            (c) => c.id !== commentId,
          ),
        },
        loadingStates: { ...state.loadingStates, [postId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [postId]: false },
        errors: {
          ...state.errors,
          [postId]: error.message || "Failed to delete comment",
        },
      }));
      throw error;
    }
  },

  updateComment: async (postId, commentId, requesterId, content) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [postId]: true },
      errors: { ...state.errors, [postId]: null },
    }));
    try {
      await api.patch(`/comments/${commentId}`, {
        requesterId,
        content,
      });

      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).map((c) =>
            c.id === commentId ? { ...c, content } : c,
          ),
        },
        loadingStates: { ...state.loadingStates, [postId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [postId]: false },
        errors: {
          ...state.errors,
          [postId]: error.message || "Failed to update comment",
        },
      }));
      throw error;
    }
  },
}));
