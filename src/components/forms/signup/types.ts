
import { z } from "zod";

export type UserRole = 'runner' | 'business';

// Define schema for runner signup
export const runnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("runner")
});

// Define schema for business signup
export const businessSchema = z.object({
  personName: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  countryCode: z.string().min(1, "Please select a country code"),
  businessPhone: z.string().min(9, "Phone number must be at least 9 digits"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("business")
});

// Combine both schemas
export const signupSchema = z.discriminatedUnion("role", [
  runnerSchema,
  businessSchema
]);

export type FormValues = z.infer<typeof signupSchema>;

export interface SignupFormProps {
  onSuccess?: () => void;
  suggestedRole?: 'runner' | 'business' | null;
}
