import { Button } from "@/components/ui/button";
import { updateProfileSchema } from "@/schemas/updateProfile";
import { useAuthStore } from "@/store/useAuthStore";
import type { UpdateUser } from "@/types/user";
import { Form, Formik } from "formik";
import { User } from "lucide-react";
import { toast } from "react-hot-toast";
import AuthInput from "../auth/AuthInput";

interface EditProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditProfileForm = ({ onSuccess, onCancel }: EditProfileFormProps) => {
  const { user, updateProfile, isLoading } = useAuthStore();

  const initialValues = {
    name: user?.name || "",
    surname: user?.surname || "",
    photo: user?.photo || "",
  };

  const handleSubmit = async (values: UpdateUser) => {
    try {
      await updateProfile(values);
      toast.success("Profile updated successfully!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={updateProfileSchema}
      onSubmit={async (values) => await handleSubmit(values)}
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
          label="Photo"
          name="photo"
          type="text"
          placeholder="Enter your photo"
          icon={User}
        />

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading} variant="outline">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};

export default EditProfileForm;
