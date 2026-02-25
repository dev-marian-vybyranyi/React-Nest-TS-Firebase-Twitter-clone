import { api } from "@/api/axios";
import type { PostReaction, ReactionType } from "@/types/reaction";
import { create } from "zustand";

interface ReactionState {
  reactions: Record<string, PostReaction>;
  react: (postId: string, type: ReactionType) => Promise<void>;
  remove: (postId: string) => Promise<void>;
  fetchStats: (postId: string) => Promise<void>;
  setReaction: (postId: string, reaction: PostReaction) => void;
  incrementComments: (postId: string) => void;
  decrementComments: (postId: string) => void;
}

export const useReactionStore = create<ReactionState>((set, get) => ({
  reactions: {},

  react: async (postId: string, type: ReactionType) => {
    const current = get().reactions[postId];
    const isSame = current?.userReaction === type;

    const likesCount = current?.likesCount ?? 0;
    const dislikesCount = current?.dislikesCount ?? 0;
    const prev = current?.userReaction;

    let newReaction: PostReaction;

    if (isSame) {
      newReaction = {
        userReaction: null,
        likesCount: type === "like" ? likesCount - 1 : likesCount,
        dislikesCount: type === "dislike" ? dislikesCount - 1 : dislikesCount,
        commentsCount: current?.commentsCount,
      };
    } else {
      newReaction = {
        userReaction: type,
        likesCount:
          type === "like"
            ? likesCount + 1
            : prev === "like"
              ? likesCount - 1
              : likesCount,
        dislikesCount:
          type === "dislike"
            ? dislikesCount + 1
            : prev === "dislike"
              ? dislikesCount - 1
              : dislikesCount,
        commentsCount: current?.commentsCount,
      };
    }

    set((state) => ({
      reactions: { ...state.reactions, [postId]: newReaction },
    }));

    try {
      if (isSame) {
        await api.delete(`/posts/${postId}/reactions`);
      } else {
        await api.put(`/posts/${postId}/reactions/${type}`);
      }
    } catch {
      set((state) => ({
        reactions: { ...state.reactions, [postId]: current },
      }));
    }
  },

  remove: async (postId) => {
    const current = get().reactions[postId];
    set((state) => ({
      reactions: {
        ...state.reactions,
        [postId]: { ...current, userReaction: null },
      },
    }));
    try {
      await api.delete(`/posts/${postId}/reactions`);
    } catch {
      set((state) => ({
        reactions: { ...state.reactions, [postId]: current },
      }));
    }
  },

  fetchStats: async (postId) => {
    const response = await api.get(`/posts/${postId}/reactions`);
    set((state) => ({
      reactions: { ...state.reactions, [postId]: response.data },
    }));
  },

  setReaction: (postId: string, reaction: PostReaction) => {
    set((state) => ({
      reactions: { ...state.reactions, [postId]: reaction },
    }));
  },

  incrementComments: (postId: string) => {
    const current = get().reactions[postId];
    if (!current) return;

    set((state) => ({
      reactions: {
        ...state.reactions,
        [postId]: {
          ...current,
          commentsCount: (current.commentsCount || 0) + 1,
        },
      },
    }));
  },

  decrementComments: (postId: string) => {
    const current = get().reactions[postId];
    if (!current) return;

    set((state) => ({
      reactions: {
        ...state.reactions,
        [postId]: {
          ...current,
          commentsCount: Math.max((current.commentsCount || 0) - 1, 0),
        },
      },
    }));
  },
}));
