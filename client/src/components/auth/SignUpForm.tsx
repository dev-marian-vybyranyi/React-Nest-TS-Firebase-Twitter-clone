import { SignUpSchema } from "@/schemas/auth";
import type { SignUpFormValues } from "@/types/auth";
import { Form, Formik } from "formik";
import { KeyRound, Mail, User } from "lucide-react";
import AuthInput from "./AuthInput";
import { Button } from "../ui/button";

const SignUpForm = () => {
  const initialValues: SignUpFormValues = {
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SignUpSchema}
      onSubmit={(values) => {
        console.log(values);
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
        >
          Sign Up
        </Button>
      </Form>
    </Formik>
  );
};

export default SignUpForm;
