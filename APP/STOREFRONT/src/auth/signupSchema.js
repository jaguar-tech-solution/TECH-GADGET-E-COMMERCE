import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(100),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Please provide a valid email address").max(255),
    phone: z.string().trim().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100)
      .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
      .refine((val) => /[a-z]/.test(val), { message: "Password must contain at least one lowercase letter" })
      .refine((val) => /[0-9]/.test(val), { message: "Password must contain at least one number" }),
      //.refine((val) => /\d/.test(val), { message: "Password must contain at least one number" })
      //.refine((val) => /[^A-Za-z0-9]/.test(val), { message: "Password must contain at least one symbol" }),

    confirmPassword: z.string().min(1, "Please confirm your password"),
   /*  terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms of Service and Privacy Policy" }),
    }), */
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Attaches the error directly to confirmPassword
  });