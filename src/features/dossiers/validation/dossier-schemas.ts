import { z } from "zod";
import {
  businessPhases,
  dossierStatuses,
  missionTypes,
  milestoneStatuses,
  taskStatuses,
} from "@/lib/domain/enums";

export const contactLinkSchema = z.object({
  contactId: z.string().cuid("Contact invalide"),
  roleLabel: z.string().trim().max(120).optional(),
  isPrimary: z.boolean().default(false),
});

export const residenceInfoSchema = z.object({
  operationName: z.string().trim().max(160).optional(),
  typology: z.string().trim().max(120).optional(),
  lotCount: z.number().int().nonnegative().optional(),
  surfaceSquareMeters: z.number().nonnegative().optional(),
  levelsCount: z.number().int().nonnegative().optional(),
  isOccupied: z.boolean().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const chantierInfoSchema = z.object({
  siteName: z.string().trim().max(160).optional(),
  addressLine1: z.string().trim().max(160).optional(),
  addressLine2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().max(20).optional(),
  city: z.string().trim().max(120).optional(),
  accessNotes: z.string().trim().max(2000).optional(),
  safetyNotes: z.string().trim().max(2000).optional(),
  expectedStartDate: z.coerce.date().optional(),
  expectedEndDate: z.coerce.date().optional(),
});

export const adminInfoSchema = z.object({
  permitReference: z.string().trim().max(120).optional(),
  permitFiledAt: z.coerce.date().optional(),
  permitGrantedAt: z.coerce.date().optional(),
  insurancePolicy: z.string().trim().max(160).optional(),
  projectBudgetAmount: z.number().nonnegative().optional(),
  estimatedWorksAmount: z.number().nonnegative().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const missionFeeSchema = z.object({
  type: z.enum(missionTypes),
  feeAmount: z.number().nonnegative().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const milestoneSchema = z.object({
  title: z.string().trim().min(2, "Le titre du jalon est requis"),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(milestoneStatuses).default("PLANNED"),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  phase: z.enum(businessPhases).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Le titre de la tâche est requis"),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(taskStatuses).default("TODO"),
  dueDate: z.coerce.date().optional(),
  priority: z.number().int().min(1).max(3).default(2),
  assignedToUserId: z.string().cuid().optional(),
});

export const dossierSchema = z.object({
  clientId: z.string().cuid("Client invalide"),
  reference: z.string().trim().min(3, "La référence est requise").max(40),
  title: z.string().trim().min(3, "Le titre est requis").max(180),
  description: z.string().trim().max(4000).optional(),
  status: z.enum(dossierStatuses).default("ACTIVE"),
  phase: z.enum(businessPhases),
  priority: z.number().int().min(1).max(3).default(2),
  city: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(80).default("France"),
  addressLine1: z.string().trim().max(160).optional(),
  addressLine2: z.string().trim().max(160).optional(),
  projectLabel: z.string().trim().max(160).optional(),
  startDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  chantierStartDate: z.coerce.date().optional(),
  receptionDate: z.coerce.date().optional(),
  notes: z.string().trim().max(4000).optional(),
  contacts: z.array(contactLinkSchema).default([]),
  residenceInfo: residenceInfoSchema.optional(),
  chantierInfo: chantierInfoSchema.optional(),
  adminInfo: adminInfoSchema.optional(),
  missions: z.array(missionFeeSchema).default([]),
});

export type DossierInput = z.infer<typeof dossierSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
