import z from "zod";

export const commentsSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty"),
});
