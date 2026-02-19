import { Button } from "@/components/ui/button";
import { CommentSchema } from "@/schemas/comment";
import { useAuthStore } from "@/store/useAuthStore";
import { useCommentStore } from "@/store/useCommentStore";
import { useReactionStore } from "@/store/useReactionStore";
import { Form, Formik } from "formik";
import { Forward } from "lucide-react";
import { User } from "lucide-react";

interface CommentFormProps {
  postId: string;
}

const CommentForm = ({ postId }: CommentFormProps) => {
  const { user } = useAuthStore();
  const { addComment } = useCommentStore();
  const { incrementComments } = useReactionStore();

  const handleCommentSubmit = async (
    values: { content: string },
    { resetForm }: { resetForm: () => void },
  ) => {
    if (!user) return;

    try {
      await addComment(
        postId,
        user.uid,
        `${user.name} ${user.surname}`,
        user.photo || null,
        values.content,
      );
      incrementComments(postId);
      resetForm();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="flex gap-4 px-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {user?.photo ? (
          <img
            src={user.photo}
            alt={`${user.name} ${user.surname}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-slate-400" />
        )}
      </div>

      <Formik
        initialValues={{ content: "" }}
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
            <div className="flex justify-end items-center">
              <Button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
                className="rounded-full px-4 font-bold"
                size="sm"
              >
                {isSubmitting ? "Posting..." : "Reply"}
                {!isSubmitting && <Forward className="h-6 w-6" />}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CommentForm;
