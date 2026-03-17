import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Le nom du maître d'ouvrage est requis").max(180),
  legalName: z.string().trim().max(180).optional(),
  clientCode: z.string().trim().max(40).optional(),
  email: z.email("Adresse e-mail invalide").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  website: z.url("URL invalide").optional().or(z.literal("")),
  vatNumber: z.string().trim().max(40).optional(),
  siren: z.string().trim().max(20).optional(),
  billingAddress: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const contactSchema = z.object({
  clientId: z.string().cuid().optional(),
  firstName: z.string().trim().min(2, "Le prénom est requis").max(120),
  lastName: z.string().trim().min(2, "Le nom est requis").max(120),
  roleLabel: z.string().trim().max(120).optional(),
  email: z.email("Adresse e-mail invalide").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  mobilePhone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(2000).optional(),
  isPrimary: z.boolean().default(false),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
