import { api } from "@/api/axios";
import type { PostReaction, ReactionType } from "@/types/reaction";
import { create } from "zustand";

interface ReactionState {
  reactions: Record<string, PostReaction>;
  react: (postId: string, type: ReactionType) => Promise<void>;
  remove: (postId: string) => Promise<void>;
  fetchStats: (postId: string) => Promise<void>;
  setReaction: (postId: string, reaction: PostReaction) => void;
}

export const useReactionStore = create<ReactionState>((set, get) => ({
  reactions: {},

  react: async (postId: string, type: ReactionType) => {
    const current = get().reactions[postId];
    const isSame = current?.userReaction === type;

    const likes = current?.likes ?? 0;
    const dislikes = current?.dislikes ?? 0;
    const prev = current?.userReaction;

    let newReaction: PostReaction;

    if (isSame) {
      newReaction = {
        userReaction: null,
        likes: type === "like" ? likes - 1 : likes,
        dislikes: type === "dislike" ? dislikes - 1 : dislikes,
        commentsCount: current?.commentsCount,
      };
    } else {
      newReaction = {
        userReaction: type,
        likes:
          type === "like" ? likes + 1 : prev === "like" ? likes - 1 : likes,
        dislikes:
          type === "dislike"
            ? dislikes + 1
            : prev === "dislike"
              ? dislikes - 1
              : dislikes,
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
}));
