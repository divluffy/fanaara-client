// lib/validation/login-schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "error_invalid_email" })
    .min(1, { message: "error_required_email" }),
  password: z
    .string()
    .min(1, { message: "error_required_password" })
    .min(8, { message: "error_min_password" }),
  remember_me: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
