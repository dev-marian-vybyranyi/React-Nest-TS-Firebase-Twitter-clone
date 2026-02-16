import * as Yup from "yup";

export const updateProfileSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").optional(),
  surname: Yup.string()
    .min(2, "Surname must be at least 2 characters")
    .optional(),
  photo: Yup.string().url("Must be a valid URL").optional(),
});
