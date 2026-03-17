import { z } from "zod";
import { taskStatuses } from "@/lib/domain/enums";

export const taskSchema = z.object({
  dossierId: z.string().cuid("Dossier invalide"),
  title: z.string().trim().min(2, "Le titre de la tâche est requis"),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(taskStatuses).default("TODO"),
  dueDate: z.coerce.date().optional(),
  priority: z.number().int().min(1).max(3).default(2),
  assignedToUserId: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v : undefined)),
});

export type TaskInput = z.infer<typeof taskSchema>;
