import { api } from "@/api/axios";
import { auth } from "@/firebase";
import type { SignUpFormValues, User } from "@/types/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (data: SignUpFormValues) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),

  signUp: async ({ confirmPassword, ...signUpData }: SignUpFormValues) => {
    set({ isLoading: true, error: null });

    try {
      await api.post("/auth/signup", signUpData);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        signUpData.email,
        signUpData.password,
      );

      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email as string,
          name: userCredential.user.displayName?.split(" ")[0] || "",
          surname: userCredential.user.displayName?.split(" ")[1] || "",
          photo: userCredential.user.photoURL as string | undefined,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Signup failed. Please try again.";
      set({
        error: Array.isArray(message) ? message[0] : message,
        isLoading: false,
      });
      throw error;
    }
  },
}));
