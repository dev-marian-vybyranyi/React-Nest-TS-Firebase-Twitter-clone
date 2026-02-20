import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CommentSchema } from "@/schemas/comment";
import { useAuthStore } from "@/store/useAuthStore";
import { useReplyStore } from "@/store/useReplyStore";
import type { Comment } from "@/types/comment";
import { Form, Formik } from "formik";
import { Forward } from "lucide-react";

interface ReplyFormProps {
  commentId: string;
  postId: string;
  reply?: Comment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReplyForm = ({
  commentId,
  postId,
  reply,
  onSuccess,
  onCancel,
}: ReplyFormProps) => {
  const { user } = useAuthStore();
  const { addReply, updateReply } = useReplyStore();

  const handleReplySubmit = async (
    values: { content: string },
    { resetForm }: { resetForm: () => void },
  ) => {
    if (!user) return;

    try {
      if (reply) {
        await updateReply(commentId, reply.id, user.uid, values.content);
        if (onSuccess) onSuccess();
      } else {
        await addReply(
          commentId,
          postId,
          user.uid,
          `${user.name} ${user.surname}`,
          user.photo || null,
          values.content,
        );
        resetForm();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Failed to save reply:", error);
    }
  };

  return (
    <div className="flex gap-3 mt-2">
      <UserAvatar
        src={user?.photo}
        alt={`${user?.name} ${user?.surname}`}
        className="w-8 h-8"
      />

      <Formik
        initialValues={{ content: reply ? reply.content : "" }}
        validationSchema={CommentSchema}
        onSubmit={handleReplySubmit}
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
              className="flex min-h-[60px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
              name="content"
              placeholder="Write a reply..."
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
                  className="px-3 py-1 text-xs"
                  size="sm"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isValid || (!reply && !dirty) || isSubmitting}
                className="bg-blue-500 text-white rounded-md py-1 px-3 text-xs disabled:bg-blue-300 disabled:cursor-not-allowed h-8"
                size="sm"
              >
                {isSubmitting
                  ? reply
                    ? "Saving..."
                    : "Replying..."
                  : reply
                    ? "Save"
                    : "Reply"}
                {!isSubmitting && !reply && (
                  <Forward className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ReplyForm;
