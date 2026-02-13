import { Button } from "@/components/ui/button";
import { SignInSchema } from "@/schemas/auth";
import type { SignInFormValues } from "@/types/auth";
import { Form, Formik } from "formik";
import { KeyRound, Mail } from "lucide-react";
import { AuthInput } from "./AuthInput";

export const SignInForm = () => {
  const initialValues: SignInFormValues = {
    email: "",
    password: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SignInSchema}
      onSubmit={(values) => {
        console.log("Email Login...", values);
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
        >
          Sign In
        </Button>
      </Form>
    </Formik>
  );
};
