import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(5).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
});
