import GoogleButton from "@/components/auth/GoogleButton";
import SignInForm from "@/components/auth/SignInForm";
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
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Card className="w-full max-w-[380px] mx-4 sm:mx-0 shadow-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Sign in to Twitter
          </CardTitle>
          <CardDescription>
            Welcome back! Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <GoogleButton label="Sign in with Google" />

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
