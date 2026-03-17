"use server";

import { requireUserSession } from "@/lib/auth/session";
import {
  cancelInvoice,
  createInvoice,
  deleteDraftInvoice,
  getInvoiceById,
  getInvoiceCreationContext,
  getPaymentCreationContext,
  listInvoices,
  listPayments,
  registerPayment,
  updateInvoiceWorkflowStatus,
} from "@/features/invoices/server/invoice-repository";
import type {
  InvoiceInput,
  PaymentInput,
} from "@/features/invoices/validation/invoice-schemas";

export async function listInvoicesAction(dossierId?: string) {
  const session = await requireUserSession();

  return listInvoices(session.user.workspaceId, { dossierId });
}

export async function getInvoiceAction(invoiceId: string) {
  const session = await requireUserSession();

  return getInvoiceById(session.user.workspaceId, invoiceId);
}

export async function getInvoiceCreationContextAction(dossierId?: string) {
  const session = await requireUserSession();

  return getInvoiceCreationContext(session.user.workspaceId, dossierId);
}

export async function createInvoiceAction(input: InvoiceInput) {
  const session = await requireUserSession();

  return createInvoice(session.user.workspaceId, session.user.id, input);
}

export async function setInvoiceWorkflowStatusAction(
  invoiceId: string,
  nextStatus: "ISSUED" | "SENT" | "PENDING"
) {
  const session = await requireUserSession();

  return updateInvoiceWorkflowStatus(
    session.user.workspaceId,
    session.user.id,
    invoiceId,
    nextStatus
  );
}

export async function cancelInvoiceAction(invoiceId: string) {
  const session = await requireUserSession();

  return cancelInvoice(session.user.workspaceId, session.user.id, invoiceId);
}

export async function deleteDraftInvoiceAction(invoiceId: string) {
  const session = await requireUserSession();

  return deleteDraftInvoice(session.user.workspaceId, session.user.id, invoiceId);
}

export async function listPaymentsAction(dossierId?: string) {
  const session = await requireUserSession();

  return listPayments(session.user.workspaceId, { dossierId });
}

export async function getPaymentCreationContextAction(
  options?: { dossierId?: string; invoiceId?: string }
) {
  const session = await requireUserSession();

  return getPaymentCreationContext(session.user.workspaceId, options);
}

export async function registerPaymentAction(input: PaymentInput) {
  const session = await requireUserSession();

  return registerPayment(session.user.workspaceId, session.user.id, input);
}
