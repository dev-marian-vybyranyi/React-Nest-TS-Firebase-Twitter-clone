import { api } from "@/api/axios";
import type { Comment } from "@/types/comment";
import { create } from "zustand";
import type { AppError } from "@/types/error";

interface ReplyState {
  replies: Record<string, Comment[]>;
  loadingStates: Record<string, boolean>;
  errors: Record<string, string | null>;

  fetchReplies: (commentId: string) => Promise<void>;
  addReply: (
    commentId: string,
    postId: string,
    authorId: string,
    authorUsername: string,
    authorPhotoURL: string | null,
    content: string,
  ) => Promise<void>;
  deleteReply: (
    commentId: string,
    replyId: string,
    requesterId: string,
  ) => Promise<void>;
  updateReply: (
    commentId: string,
    replyId: string,
    requesterId: string,
    content: string,
  ) => Promise<void>;
}

export const useReplyStore = create<ReplyState>((set) => ({
  replies: {},
  loadingStates: {},
  errors: {},

  fetchReplies: async (commentId: string) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [commentId]: true },
      errors: { ...state.errors, [commentId]: null },
    }));
    try {
      const response = await api.get<{ docs: Comment[] }>(
        `/comment/${commentId}/replies?limit=10`,
      );
      set((state) => ({
        replies: { ...state.replies, [commentId]: response.data.docs },
        loadingStates: { ...state.loadingStates, [commentId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [commentId]: false },
        errors: {
          ...state.errors,
          [commentId]: error.message || "Failed to fetch replies",
        },
      }));
    }
  },

  addReply: async (
    commentId,
    postId,
    authorId,
    authorUsername,
    authorPhotoURL,
    content,
  ) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [commentId]: true },
      errors: { ...state.errors, [commentId]: null },
    }));
    try {
      const response = await api.post<Comment>("/comment", {
        postId,
        authorId,
        authorUsername,
        authorPhotoURL,
        content,
        parentId: commentId,
      });

      const newReply = response.data;

      set((state) => ({
        replies: {
          ...state.replies,
          [commentId]: [...(state.replies[commentId] || []), newReply],
        },
        loadingStates: { ...state.loadingStates, [commentId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [commentId]: false },
        errors: {
          ...state.errors,
          [commentId]: error.message || "Failed to add reply",
        },
      }));
      throw error;
    }
  },

  deleteReply: async (commentId, replyId, requesterId) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [commentId]: true },
      errors: { ...state.errors, [commentId]: null },
    }));
    try {
      await api.delete(`/comment/${replyId}`, {
        data: { requesterId },
      });

      set((state) => ({
        replies: {
          ...state.replies,
          [commentId]: (state.replies[commentId] || []).filter(
            (r) => r.id !== replyId,
          ),
        },
        loadingStates: { ...state.loadingStates, [commentId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [commentId]: false },
        errors: {
          ...state.errors,
          [commentId]: error.message || "Failed to delete reply",
        },
      }));
      throw error;
    }
  },

  updateReply: async (commentId, replyId, requesterId, content) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [commentId]: true },
      errors: { ...state.errors, [commentId]: null },
    }));
    try {
      await api.patch(`/comment/${replyId}`, {
        requesterId,
        content,
      });

      set((state) => ({
        replies: {
          ...state.replies,
          [commentId]: (state.replies[commentId] || []).map((r) =>
            r.id === replyId ? { ...r, content } : r,
          ),
        },
        loadingStates: { ...state.loadingStates, [commentId]: false },
      }));
    } catch (e) {
      const error = e as AppError;
      set((state) => ({
        loadingStates: { ...state.loadingStates, [commentId]: false },
        errors: {
          ...state.errors,
          [commentId]: error.message || "Failed to update reply",
        },
      }));
      throw error;
    }
  },
}));
