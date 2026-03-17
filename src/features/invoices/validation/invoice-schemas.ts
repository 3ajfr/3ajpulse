import { z } from "zod";
import {
  invoiceStatuses,
  invoiceTypes,
  missionTypes,
  paymentMethods,
} from "@/lib/domain/enums";

export const invoiceLineSchema = z.object({
  missionType: z.enum(missionTypes).optional(),
  label: z.string().trim().min(2, "Le libellé est requis"),
  description: z.string().trim().max(2000).optional(),
  quantity: z.number().positive("La quantité doit être positive"),
  unitPrice: z.number().nonnegative("Le prix unitaire doit être positif ou nul"),
  vatRate: z.number().min(0).max(100).default(20),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const invoiceSchema = z.object({
  dossierId: z.string().cuid("Dossier invalide"),
  invoiceNo: z.string().trim().min(3).max(40).optional(),
  type: z.enum(invoiceTypes),
  status: z.enum(invoiceStatuses).default("DRAFT"),
  issueDate: z.coerce.date().optional(),
  sentAt: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  paidAt: z.coerce.date().optional(),
  currency: z.string().trim().length(3).default("EUR"),
  label: z.string().trim().min(3, "Le libellé est requis").max(180),
  notes: z.string().trim().max(4000).optional(),
  subtotalAmount: z.number().nonnegative(),
  vatAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  lines: z.array(invoiceLineSchema).min(1, "Au moins une ligne est requise"),
});

export const paymentAllocationSchema = z.object({
  invoiceId: z.string().cuid("Facture invalide"),
  amount: z.number().positive("Le montant imputé doit être positif"),
});

export const paymentSchema = z.object({
  dossierId: z.string().cuid().optional(),
  receivedAt: z.coerce.date(),
  amount: z.number().positive("Le montant doit être positif"),
  method: z.enum(paymentMethods).default("TRANSFER"),
  reference: z.string().trim().max(120).optional(),
  payerName: z.string().trim().max(180).optional(),
  notes: z.string().trim().max(2000).optional(),
  allocations: z.array(paymentAllocationSchema).default([]),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
