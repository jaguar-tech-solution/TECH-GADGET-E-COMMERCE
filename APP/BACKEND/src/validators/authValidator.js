import { z } from "zod"

export const registerSchema = z.object({
    body: z.object({
        firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(100),
        lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(100),
        email: z.string().trim().toLowerCase().email("Please provide a valid email address").max(255),
        phone: z.string().trim().optional(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(100)
            // Custom validation for essential structural security
            .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
            .refine((val) => /[a-z]/.test(val), { message: "Password must contain at least one lowercase letter" })
            .refine((val) => /[0-9]/.test(val), { message: "Password must contain at least one number" }),
    }),

})
export const loginSchema = z.object({
    body:z.object({
        email: z.string().trim().toLowerCase().email("Please Provide a valide email address"),
        password: z.string().min(1, "Password is required")
    }),
})