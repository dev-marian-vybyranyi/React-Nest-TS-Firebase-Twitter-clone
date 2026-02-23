import { api } from "@/api/axios";
import { auth, googleProvider } from "@/firebase";
import type { SignUpFormValues, SignInFormValues } from "@/types/forms";
import type { UpdateUser, User } from "@/types/user";
import type { AuthResponse, SignUpResponse } from "@/types/auth";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updatePassword,
} from "firebase/auth";
import { create } from "zustand";
import type { AppError } from "@/types/error";

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
  deleteUser: () => Promise<void>;
  updateProfile: (updateData: UpdateUser) => Promise<AuthResponse>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),

  signUp: async ({ confirmPassword, ...signUpData }: SignUpFormValues) => {
    void confirmPassword;
    set({ isLoading: true, error: null });

    try {
      await api.post<SignUpResponse>("/auth/signup", signUpData);

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
    } catch (e) {
      const error = e as AppError;
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

      const { data } = await api.post<AuthResponse>("/auth/signin", { token });

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
    } catch (e) {
      const error = e as AppError;
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
    } catch (e) {
      const error = e as AppError;
      set({ error: error.message, isLoading: false });
    }
  },

  googleSignIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();

      const { data } = await api.post<AuthResponse>("/auth/google", { token });

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
    } catch (e) {
      const error = e as AppError;
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

  deleteUser: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.delete("/auth/delete");
      await auth.signOut();
      set({ user: null, isLoading: false });
    } catch (e) {
      const error = e as AppError;
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (updateData: UpdateUser) => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await api.patch<AuthResponse>("/user/me", updateData);

      set((state) => ({
        user: state.user ? { ...state.user, ...updateData } : null,
        isLoading: false,
      }));

      return data;
    } catch (e) {
      const error = e as AppError;
      const message =
        error.response?.data?.message || "Update failed. Please try again.";
      set({
        error: Array.isArray(message) ? message[0] : message,
        isLoading: false,
      });
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No user is currently signed in");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      set({ isLoading: false });
    } catch (e) {
      const error = e as AppError;
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
    } catch (e) {
      const error = e as AppError;
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
