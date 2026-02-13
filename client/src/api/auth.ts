import { api } from "./axios";
import type { User, SignUpFormValues } from "@/types/auth";

export const authApi = {
  signUp: async (data: SignUpFormValues) => {
    const { confirmPassword, ...signUpData } = data;

    const response = await api.post<{ user: User }>("/auth/signup", signUpData);
    return response.data;
  },
};
