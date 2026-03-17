import { z } from "zod";
import {
  milestoneStatuses,
  businessPhases,
} from "@/lib/domain/enums";

export const milestoneSchema = z.object({
  dossierId: z.string().cuid("Dossier invalide"),
  title: z.string().trim().min(2, "Le titre du jalon est requis"),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(milestoneStatuses).default("PLANNED"),
  dueDate: z.coerce.date().optional(),
  phase: z
    .union([z.enum(businessPhases), z.literal("")])
    .optional()
    .transform((v) => (v && String(v) !== "" ? v : undefined)),
  sortOrder: z.number().int().nonnegative().default(0),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;
