import { Form, Formik } from "formik";
import { PostSchema } from "@/schemas/post";
import AuthInput from "../auth/AuthInput";
import { PhotoUpload } from "../ui/PhotoUpload";
import { useState } from "react";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore";
import { toast } from "react-hot-toast";

const CreatePost = () => {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { createPosts, loading: isPostCreating } = usePostStore();
  const { uploadPhoto, isUploading, resetUpload } = useUploadPhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialValues = {
    text: "",
    title: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: any,
  ) => {
    if (!user) return;

    try {
      let photoUrl = "";
      if (selectedFile) {
        const path = `posts/${user.uid}/${Date.now()}_${selectedFile.name}`;
        const url = await uploadPhoto(selectedFile, path);
        if (url) photoUrl = url;
      }

      await createPosts({
        title: values.title,
        text: values.text,
        photo: photoUrl,
      });

      toast.success("Post created successfully!");
      resetForm();
      setSelectedFile(null);
      resetUpload();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={PostSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <AuthInput
            label="Title"
            name="title"
            type="text"
            placeholder="Enter your title"
          />
          <AuthInput
            label="Text"
            name="text"
            type="text"
            placeholder="Enter your text"
          />
          <PhotoUpload
            type="post"
            onPhotoSelected={(file) => {
              setSelectedFile(file);
            }}
            onPhotoCleared={() => {
              setSelectedFile(null);
              resetUpload();
            }}
            onPhotoDeleted={() => {
              setSelectedFile(null);
              resetUpload();
            }}
            isLoading={isUploading || isAuthLoading || isPostCreating}
          />
          <button
            type="submit"
            disabled={isUploading || isPostCreating || isSubmitting}
            className="w-full bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isUploading
              ? "Uploading..."
              : isPostCreating
                ? "Creating..."
                : "Create Post"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default CreatePost;
