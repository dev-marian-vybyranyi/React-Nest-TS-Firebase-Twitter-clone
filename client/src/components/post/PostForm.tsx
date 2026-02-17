import { Form, Formik } from "formik";
import { PostSchema } from "@/schemas/post";
import AuthInput from "../auth/AuthInput";
import { PhotoUpload } from "../ui/PhotoUpload";
import { useState } from "react";
import { useUploadPhoto } from "@/hooks/useUploadPhoto";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore";
import { toast } from "react-hot-toast";
import type { Post } from "@/types/post";

interface PostFormProps {
  post?: Post;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PostForm = ({ post, onSuccess, onCancel }: PostFormProps) => {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { createPosts, updatePost, loading: isPostLoading } = usePostStore();
  const { uploadPhoto, isUploading, resetUpload } = useUploadPhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditMode = !!post;

  const initialValues = {
    title: post?.title || "",
    text: post?.text || "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { resetForm }: any,
  ) => {
    if (!user) return;

    try {
      let photoUrl = post?.photo || "";

      if (selectedFile) {
        const path = `posts/${user.uid}/${Date.now()}_${selectedFile.name}`;
        const url = await uploadPhoto(selectedFile, path);
        if (url) photoUrl = url;
      }

      if (isEditMode && post) {
        await updatePost(post.id, {
          title: values.title,
          text: values.text,
          photo: photoUrl,
        });
        toast.success("Post updated successfully!");
      } else {
        await createPosts({
          title: values.title,
          text: values.text,
          photo: photoUrl,
        });
        toast.success("Post created successfully!");
        resetForm();
        setSelectedFile(null);
        resetUpload();
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save post:", error);
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
            currentPhotoUrl={post?.photo}
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
            isLoading={isUploading || isAuthLoading || isPostLoading}
          />
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isUploading || isPostLoading || isSubmitting}
              className="flex-1 bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isUploading
                ? "Uploading..."
                : isPostLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Post"
                    : "Create Post"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;
