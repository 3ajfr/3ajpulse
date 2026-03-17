import { z } from "zod";
import { competences } from "@/lib/domain/enums";

export const timeEntrySchema = z.object({
  dossierId: z.string().cuid("Dossier invalide"),
  missionFeeId: z.string().cuid().optional(),
  date: z.coerce.date(),
  minutes: z.number().int().positive("La durée doit être positive"),
  competence: z.enum(competences),
  note: z.string().trim().max(2000).optional(),
  billable: z.boolean().default(true),
  hourlyValue: z.number().nonnegative().optional(),
});

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
