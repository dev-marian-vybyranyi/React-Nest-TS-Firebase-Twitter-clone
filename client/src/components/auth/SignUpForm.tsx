import { useAuthStore } from "@/store/useAuthStore";
import { SignUpSchema } from "@/schemas/auth";
import type { SignUpFormValues } from "@/types/forms";
import { Form, Formik } from "formik";
import { KeyRound, Mail, User } from "lucide-react";
import AuthInput from "./AuthInput";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const SignUpForm = () => {
  const initialValues: SignUpFormValues = {
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const { signUp, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SignUpSchema}
      onSubmit={async (values) => {
        await signUp(values);
        navigate("/");
      }}
    >
      <Form className="grid gap-4">
        <AuthInput
          label="Name"
          name="name"
          type="text"
          placeholder="Enter your name"
          icon={User}
        />
        <AuthInput
          label="Surname"
          name="surname"
          type="text"
          placeholder="Enter your surname"
          icon={User}
        />
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
        <AuthInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          icon={KeyRound}
        />
        <Button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
      </Form>
    </Formik>
  );
};

export default SignUpForm;
