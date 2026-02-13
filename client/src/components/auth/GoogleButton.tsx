import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import googleIcon from "@/assets/icons/google.svg";

interface GoogleButtonProps {
  label: string;
}

const GoogleButton = ({ label }: GoogleButtonProps) => {
  const { googleSignIn, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate("/");
    } catch (error) {
      console.error("Google Sign In failed", error);
    }
  };
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <img src={googleIcon} alt="Google" className="h-5 w-5" />
      {label}
    </Button>
  );
};

export default GoogleButton;
