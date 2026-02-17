import { create } from "zustand";
import { api } from "@/api/axios";
import type { Post, PostsResponse } from "@/types/post";

interface PostState {
  posts: Post[];
  lastDocId: string | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  fetchPosts: (
    limit?: number,
    append?: boolean,
    userId?: string,
    searchText?: string,
  ) => Promise<void>;
  createPosts: (
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "userId">,
  ) => Promise<void>;
  updatePost: (postId: string, postData: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  lastDocId: null,
  hasMore: true,
  loading: false,
  error: null,

  fetchPosts: async (
    limit = 10,
    append = false,
    userId?: string,
    searchText?: string,
  ) => {
    const { lastDocId, loading, hasMore } = usePostStore.getState();

    if (append && (loading || !hasMore || !lastDocId)) return;

    set({ loading: true, error: null });

    try {
      const baseUrl = userId ? `/posts/user/${userId}` : "/posts";
      let url = `${baseUrl}?limit=${limit}`;

      if (searchText) {
        url += `&search=${encodeURIComponent(searchText)}`;
      }

      if (append && lastDocId) {
        url += `&lastDocId=${lastDocId}`;
      }

      const response = await api.get<PostsResponse>(url);

      set((state) => ({
        posts: append
          ? [...state.posts, ...response.data.posts]
          : response.data.posts,
        lastDocId: response.data.lastDocId,
        hasMore: response.data.hasMore,
        loading: false,
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to fetch posts",
      });
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

  deletePost: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/posts/${postId}`);
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
        loading: false,
      }));
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to delete post" });
      throw error;
    }
  },
}));
