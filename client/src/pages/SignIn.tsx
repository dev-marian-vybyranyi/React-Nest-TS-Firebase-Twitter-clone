import googleIcon from "@/assets/icons/google.svg";
import SignInForm from "@/components/auth/SignInForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const handleGoogleSignIn = () => {
    console.log("Google Sign In...");
  };

  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Card className="w-[380px] shadow-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Sign in to Twitter
          </CardTitle>
          <CardDescription>
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
          >
            <img src={googleIcon} alt="Google" className="h-5 w-5" />
            Sign in with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <SignInForm />
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => navigate("/sign-up")}
            >
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;
