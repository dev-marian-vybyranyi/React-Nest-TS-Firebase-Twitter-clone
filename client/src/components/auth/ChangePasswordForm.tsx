import { ChangePasswordSchema } from "@/schemas/auth";
import { Form, Formik } from "formik";
import AuthInput from "./AuthInput";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import type { AppError } from "@/types/error";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordForm = ({
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) => {
  const { changePassword, isLoading } = useAuthStore();

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Password changed successfully!");
      onSuccess?.();
    } catch (e) {
      const error = e as AppError;
      if (error.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        toast.error("New password is too weak");
      } else {
        toast.error(error?.message || "Failed to change password");
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ChangePasswordSchema}
      onSubmit={handleSubmit}
    >
      <Form className="grid gap-4">
        <AuthInput
          label="Current Password"
          name="currentPassword"
          type="password"
        />
        <AuthInput label="New Password" name="newPassword" type="password" />
        <AuthInput
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
        />
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="outline" disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};

export default ChangePasswordForm;
