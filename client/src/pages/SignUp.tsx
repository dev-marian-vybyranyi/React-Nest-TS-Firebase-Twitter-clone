import GoogleButton from "@/components/auth/GoogleButton";
import SignUpForm from "@/components/auth/SignUpForm";
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

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Card className="w-[380px] shadow-lg bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Sign up to Twitter
          </CardTitle>
          <CardDescription>Welcome! Please enter your details.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <GoogleButton label="Sign up with Google" />

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <SignUpForm />
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => navigate("/sign-in")}
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUp;
