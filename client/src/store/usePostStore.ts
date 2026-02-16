import { create } from "zustand";
import { api } from "@/api/axios";
import type { Post } from "@/types/post";

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  getAllPosts: () => Promise<void>;
  getAllPostsByUserId: (userId: string) => Promise<void>;
  createPosts: (
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "userId">,
  ) => Promise<void>;
  updatePost: (postId: string, postData: Partial<Post>) => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  loading: false,
  error: null,

  getAllPosts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/posts");
      set({ posts: response.data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to fetch posts" });
    }
  },

  getAllPostsByUserId: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/posts/user/${userId}`);
      set({ posts: response.data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to fetch posts" });
    }
  },

  createPosts: async (
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "userId">,
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/posts", postData);
      set((state) => ({
        posts: [response.data, ...state.posts],
        loading: false,
      }));
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to create post" });
      throw error;
    }
  },

  updatePost: async (postId: string, postData: Partial<Post>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/posts/${postId}`, postData);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, ...response.data } : post,
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to update post" });
      throw error;
    }
  },
}));
