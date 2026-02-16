import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  surname: z
    .string()
    .min(2, "Surname must be at least 2 characters")
    .optional(),
  photo: z.string().url("Must be a valid URL").optional(),
});
