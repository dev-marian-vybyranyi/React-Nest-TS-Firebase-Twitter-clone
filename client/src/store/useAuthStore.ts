import { api } from "@/api/axios";
import { auth, googleProvider } from "@/firebase";
import type { SignUpFormValues, SignInFormValues, User } from "@/types/auth";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (data: SignUpFormValues) => Promise<void>;
  signIn: (data: SignInFormValues) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
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

      await sendEmailVerification(userCredential.user);

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

  signIn: async (signInData: SignInFormValues) => {
    set({ isLoading: true, error: null });

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInData.email,
        signInData.password,
      );

      const token = await userCredential.user.getIdToken();

      const { data } = await api.post("/auth/signin", { token });

      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email as string,
          name: data.user.name || "",
          surname: data.user.surname || "",
          photo: data.user.photo || userCredential.user.photoURL || undefined,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Signin failed. Please try again.";
      set({
        error: Array.isArray(message) ? message[0] : message,
        isLoading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await auth.signOut();
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  googleSignIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();

      const { data } = await api.post("/auth/google", { token });

      set({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email as string,
          name: data.user.name,
          surname: data.user.surname,
          photo: data.user.photo,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Google Sign-In failed. Please try again.";
      set({
        error: Array.isArray(message) ? message[0] : message,
        isLoading: false,
      });
      throw error;
    }
  },
}));
