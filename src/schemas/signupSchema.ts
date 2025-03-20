
import * as z from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  role: z.enum(["voter", "candidate", "admin"]),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;
