import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CommentSchema } from "@/schemas/comment";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommentStore } from "@/store/useCommentStore";
import { useReactionStore } from "@/store/useReactionStore";
import type { Comment } from "@/types/comment";
import { Form, Formik } from "formik";
import { Forward } from "lucide-react";

interface CommentFormProps {
  postId: string;
  comment?: Comment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CommentForm = ({
  postId,
  comment,
  onSuccess,
  onCancel,
}: CommentFormProps) => {
  const { user } = useAuthStore();
  const { addComment, updateComment } = useCommentStore();
  const { incrementComments } = useReactionStore();

  const handleCommentSubmit = async (
    values: { content: string },
    { resetForm }: { resetForm: () => void },
  ) => {
    if (!user) return;

    try {
      if (comment) {
        await updateComment(postId, comment.id, user.uid, values.content);
        if (onSuccess) onSuccess();
      } else {
        await addComment(
          postId,
          user.uid,
          `${user.name} ${user.surname}`,
          user.photo || null,
          values.content,
        );
        incrementComments(postId);
        resetForm();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Failed to save comment:", error);
    }
  };

  return (
    <div className="flex gap-4 px-4">
      <UserAvatar
        src={user?.photo}
        alt={`${user?.name} ${user?.surname}`}
        className="w-10 h-10"
      />

      <Formik
        initialValues={{ content: comment ? comment.content : "" }}
        validationSchema={CommentSchema}
        onSubmit={handleCommentSubmit}
      >
        {({
          values,
          handleChange,
          handleBlur,
          isSubmitting,
          isValid,
          dirty,
        }) => (
          <Form className="flex-1 flex flex-col gap-2">
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-slate-700  px-3 py-2 text-base"
              name="content"
              placeholder="Leave a comment..."
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="flex justify-end items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-600"
                  size="sm"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isValid || (!comment && !dirty) || isSubmitting}
                className="bg-blue-500 text-white rounded-md py-2 px-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
                size="sm"
              >
                {isSubmitting
                  ? comment
                    ? "Saving..."
                    : "Posting..."
                  : comment
                    ? "Save"
                    : "Reply"}
                {!isSubmitting && !comment && <Forward className="h-6 w-6" />}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CommentForm;
