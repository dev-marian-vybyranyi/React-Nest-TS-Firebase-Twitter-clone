import { create } from "zustand";
import { api } from "@/api/axios";
import type { Post, PostsResponse } from "@/types/post";

interface PostState {
  posts: Post[];
  lastDocId: string | null;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  getAllPosts: (limit?: number) => Promise<void>;
  loadMorePosts: (limit?: number) => Promise<void>;
  getAllPostsByUserId: (userId: string, limit?: number) => Promise<void>;
  loadMorePostsByUserId: (userId: string, limit?: number) => Promise<void>;
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

  getAllPosts: async (limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<PostsResponse>(`/posts?limit=${limit}`);
      set({
        posts: response.data.posts,
        lastDocId: response.data.lastDocId,
        hasMore: response.data.hasMore,
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to fetch posts" });
    }
  },

  loadMorePosts: async (limit = 10) => {
    const { lastDocId, loading, hasMore } = usePostStore.getState();

    if (loading) return;
    if (!hasMore) return;
    if (!lastDocId) return;

    set({ loading: true });
    try {
      const response = await api.get<PostsResponse>(
        `/posts?limit=${limit}&lastDocId=${lastDocId}`,
      );

      set((state) => ({
        posts: [...state.posts, ...response.data.posts],
        lastDocId: response.data.lastDocId,
        hasMore: response.data.hasMore,
        loading: false,
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to load more posts",
      });
    }
  },

  getAllPostsByUserId: async (userId: string, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<PostsResponse>(
        `/posts/user/${userId}?limit=${limit}`,
      );
      set({
        posts: response.data.posts,
        lastDocId: response.data.lastDocId,
        hasMore: response.data.hasMore,
        loading: false,
      });
    } catch (error: any) {
      set({ loading: false, error: error.message || "Failed to fetch posts" });
    }
  },

  loadMorePostsByUserId: async (userId: string, limit = 10) => {
    const { lastDocId, loading, hasMore } = usePostStore.getState();

    if (loading) return;
    if (!hasMore) return;
    if (!lastDocId) return;

    set({ loading: true });
    try {
      const response = await api.get<PostsResponse>(
        `/posts/user/${userId}?limit=${limit}&lastDocId=${lastDocId}`,
      );

      set((state) => ({
        posts: [...state.posts, ...response.data.posts],
        lastDocId: response.data.lastDocId,
        hasMore: response.data.hasMore,
        loading: false,
      }));
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to load more posts",
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
