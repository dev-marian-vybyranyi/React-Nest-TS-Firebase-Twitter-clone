import * as Yup from "yup";

export const CommentSchema = Yup.object().shape({
  content: Yup.string()
    .trim()
    .required("Comment cannot be empty")
    .max(300, "Comment is too long"),
});