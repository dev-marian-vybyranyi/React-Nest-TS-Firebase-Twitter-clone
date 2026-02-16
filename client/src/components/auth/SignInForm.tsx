import { Button } from "@/components/ui/button";
import { SignInSchema } from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { SignInFormValues } from "@/types/forms";
import { Form, Formik } from "formik";
import { KeyRound, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthInput from "./AuthInput";

const SignInForm = () => {
  const initialValues: SignInFormValues = {
    email: "",
    password: "",
  };

  const { signIn, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SignInSchema}
      onSubmit={async (values) => {
        await signIn(values);
        navigate("/");
      }}
    >
      <Form className="grid gap-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
        />

        <AuthInput
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          icon={KeyRound}
        />

        <Button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
      </Form>
    </Formik>
  );
};

export default SignInForm;
