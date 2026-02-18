import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const useProfileActions = () => {
  const { signOut, deleteUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Success sign out");
      navigate("/sign-in");
    } catch (error) {
      console.error(error);
      toast.error("Error signing out");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      toast.success("Account deleted");
      navigate("/sign-up");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete account");
    }
  };

  return { handleSignOut, handleDeleteAccount };
};
