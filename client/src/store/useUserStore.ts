import { create } from "zustand";
import { api } from "@/api/axios";
import type { User } from "@/types/user";

interface UserState {
  viewedUser: User | null;
  loading: boolean;
  error: string | null;
  getUserById: (userId: string) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  viewedUser: null,
  loading: false,
  error: null,

  getUserById: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/user/${userId}`);
      const userData = {
        ...response.data,
        uid: response.data.id || response.data.uid,
      };
      set({ viewedUser: userData, loading: false });
    } catch (error: any) {
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch user",
      });
      throw error;
    }
  },

  clearUser: () => {
    set({ viewedUser: null, error: null });
  },
}));
