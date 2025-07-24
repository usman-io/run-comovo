
import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  date: z.string().min(1, {
    message: "Please select a date.",
  }),
  time: z.string().min(1, {
    message: "Please enter a time.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  distance: z.number().min(1).max(50),
  pace: z.number().min(3).max(12),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  maxParticipants: z.number().min(1).max(1000).optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
  unlimitedSpots: z.boolean().default(false),
  whatsappGroupLink: z.string().url().optional().or(z.literal("")),
}).refine((data) => {
  // If unlimitedSpots is false, maxParticipants must be provided
  if (!data.unlimitedSpots && (!data.maxParticipants || data.maxParticipants < 1)) {
    return false;
  }
  return true;
}, {
  message: "Max participants is required when not unlimited",
  path: ["maxParticipants"],
});

export type FormValues = z.infer<typeof formSchema>;
