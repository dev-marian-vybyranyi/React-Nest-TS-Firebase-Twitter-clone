import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";
import { Form, Formik } from "formik";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AuthInput from "./AuthInput";
import { Mail } from "lucide-react";
import { ForgotPasswordSchema } from "@/schemas/auth";

interface ForgotPasswordDialogProps {
  trigger?: React.ReactNode;
}

const ForgotPasswordDialog = ({ trigger }: ForgotPasswordDialogProps) => {
  const [open, setOpen] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const handleSubmit = async (values: { email: string }) => {
    try {
      await resetPassword(values.email);
      toast.success("Password reset email sent! Check your inbox.");
      setOpen(false);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else {
        toast.error(error?.message || "Failed to send reset email");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="link"
            type="button"
            className="text-sm text-blue-600 underline"
          >
            Forgot password?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          <Form className="grid gap-4">
            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="outline" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
