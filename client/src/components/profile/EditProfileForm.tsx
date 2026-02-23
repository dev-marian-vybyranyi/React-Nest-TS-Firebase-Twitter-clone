import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { updateProfileSchema } from "@/schemas/updateProfile";
import { useAuthStore } from "@/store/useAuthStore";
import type { UpdateUser } from "@/types/user";
import { Form, Formik } from "formik";
import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AuthInput from "../auth/AuthInput";
import type { AppError } from "@/types/error";

interface EditProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditProfileForm = ({ onSuccess, onCancel }: EditProfileFormProps) => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { uploadPhoto, deletePhoto, isUploading, uploadProgress, resetUpload } =
    useUploadPhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPhotoDeleted, setIsPhotoDeleted] = useState(false);

  const initialValues = {
    name: user?.name || "",
    surname: user?.surname || "",
    photo: user?.photo || "",
  };

  const handleSubmit = async (values: UpdateUser) => {
    try {
      let photoUrl = values.photo;

      if (isPhotoDeleted) {
        if (user?.photo && auth.currentUser) {
          const path = `users/${auth.currentUser.uid}/profile-photo`;
          await deletePhoto(path);
        }
        photoUrl = "";
      } else if (selectedFile && auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/profile-photo`;
        const uploadedUrl = await uploadPhoto(selectedFile, path);

        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        } else {
          return;
        }
      }

      const cleanedValues = Object.fromEntries(
        Object.entries({ ...values, photo: photoUrl }).filter(
          ([_, v]) => v !== "" || (isPhotoDeleted && _ === "photo"),
        ),
      );

      await updateProfile(cleanedValues);
      toast.success("Profile updated successfully!");
      onSuccess?.();
    } catch (e) {
      const error = e as AppError;
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Profile Photo</label>
          <PhotoUpload
            currentPhotoUrl={user?.photo}
            onPhotoSelected={(file) => {
              setSelectedFile(file);
              setIsPhotoDeleted(false);
            }}
            onPhotoCleared={() => {
              setSelectedFile(null);
              resetUpload();
            }}
            onPhotoDeleted={() => {
              setSelectedFile(null);
              setIsPhotoDeleted(true);
            }}
            isLoading={isUploading || isLoading}
          />
          {isUploading && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-600">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={isLoading || isUploading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            variant="outline"
          >
            {isLoading || isUploading ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};

export default EditProfileForm;
