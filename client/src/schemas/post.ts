import * as Yup from "yup";

export const PostSchema = Yup.object({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters long")
    .max(100, "Title must be at most 100 characters long")
    .required("Required"),
  text: Yup.string()
    .min(2, "Post must be at least 2 characters long")
    .max(280, "Post must be at most 280 characters long")
    .required("Required"),
  photo: Yup.string().optional(),
});
