import z from "zod";

export const blogSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  image: z.instanceof(File).optional().nullable(),
});
