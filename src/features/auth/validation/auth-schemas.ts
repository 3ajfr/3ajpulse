import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Adresse e-mail invalide").trim().toLowerCase(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const inviteUserSchema = z.object({
  email: z.email("Adresse e-mail invalide").trim().toLowerCase(),
  name: z.string().trim().min(2, "Le nom est requis"),
  role: z.enum(["OWNER", "MANAGER", "FINANCE", "MEMBER"]),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
