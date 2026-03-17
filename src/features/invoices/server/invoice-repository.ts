import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity/log-activity";
import {
  calculateInvoicePaidAmount,
  calculateInvoiceRemainingDue,
  calculateInvoiceTotals,
  calculatePaymentAllocatedAmount,
  type InvoiceLike,
  resolveInvoicePaymentStatus,
} from "@/lib/business/calculations";
import {
  invoiceSchema,
  paymentSchema,
  type InvoiceInput,
  type PaymentInput,
} from "@/features/invoices/validation/invoice-schemas";
import type { InvoiceStatus } from "@/lib/domain/enums";
import { addDays, endOfYear, startOfYear } from "date-fns";

function toFixedAmount(value: number) {
  return value.toFixed(2);
}

function ensurePositiveAmount(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function sameDayOrNow(value?: Date | null) {
  return value ?? new Date();
}

async function getScopedDossier(workspaceId: string, dossierId: string) {
  return prisma.dossier.findFirst({
    where: {
      id: dossierId,
      workspaceId,
    },
    include: {
      client: true,
      missions: {
        orderBy: { type: "asc" },
      },
      timeEntries: {
        where: { billable: true },
        orderBy: { date: "desc" },
      },
      invoices: {
        where: { status: { not: "CANCELLED" } },
        include: {
          lines: true,
          paymentAllocations: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function generateInvoiceNumber(workspaceId: string, baseDate: Date) {
  const year = baseDate.getFullYear();
  const yearPrefix = `FAC-${year}-`;
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      issueDate: {
        gte: startOfYear(baseDate),
        lte: endOfYear(baseDate),
      },
    },
    select: {
      invoiceNo: true,
    },
  });

  const nextSequence =
    invoices.reduce((maxValue, invoice) => {
      if (!invoice.invoiceNo.startsWith(yearPrefix)) {
        return maxValue;
      }

      const sequence = Number(invoice.invoiceNo.slice(yearPrefix.length));

      return Number.isFinite(sequence) ? Math.max(maxValue, sequence) : maxValue;
    }, 0) + 1;

  return `${yearPrefix}${String(nextSequence).padStart(3, "0")}`;
}

function buildInvoiceSummary<T extends InvoiceLike>(invoice: T) {
  const resolvedStatus = resolveInvoicePaymentStatus(invoice);
  const totalPaid = calculateInvoicePaidAmount(invoice);
  const remainingDue = calculateInvoiceRemainingDue(invoice);

  return {
    resolvedStatus,
    totalPaid,
    remainingDue,
  };
}

function ensureManualWorkflowStatus(status: InvoiceStatus) {
  if (status === "PAID" || status === "PARTIALLY_PAID" || status === "CANCELLED") {
    throw new Error("Ce statut est calculé automatiquement ou protégé.");
  }
}

export async function listInvoices(
  workspaceId: string,
  options?: { dossierId?: string }
) {
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      dossierId: options?.dossierId,
    },
    include: {
      dossier: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      lines: {
        orderBy: { sortOrder: "asc" },
      },
      paymentAllocations: true,
    },
    orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
  });

  return invoices.map((invoice) => ({
    ...invoice,
    ...buildInvoiceSummary(invoice),
  }));
}

export async function getInvoiceById(workspaceId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId,
    },
    include: {
      dossier: {
        include: {
          client: true,
          missions: {
            orderBy: { type: "asc" },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      lines: {
        include: {
          missionFee: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      paymentAllocations: {
        include: {
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      attachments: true,
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  return {
    ...invoice,
    ...buildInvoiceSummary(invoice),
  };
}

export async function getInvoiceCreationContext(
  workspaceId: string,
  dossierId?: string
) {
  const dossiers = await prisma.dossier.findMany({
    where: { workspaceId },
    select: {
      id: true,
      reference: true,
      title: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!dossierId) {
    return {
      dossiers,
      selectedDossier: null,
      nextInvoiceNo: await generateInvoiceNumber(workspaceId, new Date()),
      defaultVatRate: 20,
      defaultDueDate: addDays(new Date(), 30),
    };
  }

  const dossier = await getScopedDossier(workspaceId, dossierId);

  if (!dossier) {
    return {
      dossiers,
      selectedDossier: null,
      nextInvoiceNo: await generateInvoiceNumber(workspaceId, new Date()),
      defaultVatRate: 20,
      defaultDueDate: addDays(new Date(), 30),
    };
  }

  const missionBreakdown = dossier.missions.map((mission) => {
    const trackedEntries = dossier.timeEntries.filter(
      (entry) => entry.missionFeeId === mission.id
    );
    const trackedMinutes = trackedEntries.reduce((total, entry) => total + entry.minutes, 0);
    const trackedValue = trackedEntries.reduce((total, entry) => {
      const hours = entry.minutes / 60;
      const hourlyValue =
        typeof entry.hourlyValue === "number"
          ? entry.hourlyValue
          : Number(entry.hourlyValue) || 0;

      return total + hours * hourlyValue;
    }, 0);
    const alreadyInvoiced = dossier.invoices.reduce((total, invoice) => {
      return (
        total +
        invoice.lines
          .filter((line) => line.missionFeeId === mission.id)
          .reduce((lineTotal, line) => {
            const quantity =
              typeof line.quantity === "number" ? line.quantity : Number(line.quantity) || 0;
            const unitPrice =
              typeof line.unitPrice === "number"
                ? line.unitPrice
                : Number(line.unitPrice) || 0;

            return lineTotal + quantity * unitPrice;
          }, 0)
      );
    }, 0);
    const feeAmount =
      typeof mission.feeAmount === "number" ? mission.feeAmount : Number(mission.feeAmount) || 0;

    return {
      id: mission.id,
      type: mission.type,
      feeAmount,
      estimatedHours:
        typeof mission.estimatedHours === "number"
          ? mission.estimatedHours
          : Number(mission.estimatedHours) || 0,
      hourlyRate:
        typeof mission.hourlyRate === "number"
          ? mission.hourlyRate
          : Number(mission.hourlyRate) || 0,
      trackedMinutes,
      trackedValue,
      alreadyInvoiced,
      remainingFee: Math.max(0, feeAmount - alreadyInvoiced),
    };
  });

  return {
    dossiers,
    selectedDossier: {
      id: dossier.id,
      reference: dossier.reference,
      title: dossier.title,
      client: dossier.client,
      missions: missionBreakdown,
      openInvoices: dossier.invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        totalAmount: Number(invoice.totalAmount) || 0,
        ...buildInvoiceSummary(invoice),
      })),
      totalFeeAmount: missionBreakdown.reduce((total, mission) => total + mission.feeAmount, 0),
      totalTrackedValue: missionBreakdown.reduce(
        (total, mission) => total + mission.trackedValue,
        0
      ),
    },
    nextInvoiceNo: await generateInvoiceNumber(workspaceId, new Date()),
    defaultVatRate: 20,
    defaultDueDate: addDays(new Date(), 30),
  };
}

export async function getPaymentCreationContext(
  workspaceId: string,
  options?: { dossierId?: string; invoiceId?: string }
) {
  const dossiers = await prisma.dossier.findMany({
    where: { workspaceId },
    select: {
      id: true,
      reference: true,
      title: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      dossierId: options?.dossierId,
      status: { not: "CANCELLED" },
    },
    include: {
      dossier: true,
      paymentAllocations: true,
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  const openInvoices = invoices
    .map((invoice) => ({
      ...invoice,
      ...buildInvoiceSummary(invoice),
    }))
    .filter((invoice) => invoice.remainingDue > 0);

  const selectedInvoice =
    openInvoices.find((invoice) => invoice.id === options?.invoiceId) ?? null;

  return {
    dossiers,
    openInvoices,
    selectedInvoice,
    selectedDossierId: options?.dossierId ?? selectedInvoice?.dossierId ?? null,
    suggestedAmount: selectedInvoice?.remainingDue ?? 0,
  };
}

export async function createInvoice(
  workspaceId: string,
  actorUserId: string,
  input: InvoiceInput
) {
  const validatedInput = invoiceSchema.parse(input);
  ensureManualWorkflowStatus(validatedInput.status);

  const dossier = await prisma.dossier.findFirst({
    where: {
      id: validatedInput.dossierId,
      workspaceId,
    },
    include: {
      missions: true,
    },
  });

  if (!dossier) {
    throw new Error("Dossier introuvable.");
  }

  const missionTypes = validatedInput.lines
    .map((line) => line.missionType)
    .filter((missionType): missionType is NonNullable<typeof missionType> => Boolean(missionType));

  const missionFeeByType = dossier.missions.filter((mission) => missionTypes.includes(mission.type));
  const totals = calculateInvoiceTotals(validatedInput.lines);
  const issueDate = validatedInput.issueDate ?? sameDayOrNow();
  const dueDate = validatedInput.dueDate ?? addDays(issueDate, 30);
  const sentAt =
    validatedInput.status === "SENT"
      ? validatedInput.sentAt ?? sameDayOrNow(issueDate)
      : validatedInput.sentAt;
  const invoiceNo =
    validatedInput.invoiceNo ?? (await generateInvoiceNumber(workspaceId, issueDate));

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId,
      dossierId: validatedInput.dossierId,
      createdByUserId: actorUserId,
      invoiceNo,
      type: validatedInput.type,
      status: validatedInput.status,
      issueDate,
      sentAt,
      dueDate,
      paidAt: null,
      currency: validatedInput.currency,
      label: validatedInput.label,
      notes: validatedInput.notes,
      subtotalAmount: toFixedAmount(totals.subtotal),
      vatAmount: toFixedAmount(totals.vat),
      totalAmount: toFixedAmount(totals.total),
      lines: {
        create: validatedInput.lines.map((line) => ({
          missionFeeId:
            missionFeeByType.find((missionFee) => missionFee.type === line.missionType)?.id ??
            null,
          label: line.label,
          description: line.description,
          quantity: line.quantity.toFixed(2),
          unitPrice: line.unitPrice.toFixed(2),
          vatRate: line.vatRate.toFixed(2),
          sortOrder: line.sortOrder,
        })),
      },
    },
    include: {
      lines: true,
      dossier: true,
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: invoice.dossierId,
    invoiceId: invoice.id,
    entityType: "INVOICE",
    entityId: invoice.id,
    action: "invoice.created",
    description: `Création de la facture ${invoice.invoiceNo}`,
  });

  return invoice;
}

export async function updateInvoiceWorkflowStatus(
  workspaceId: string,
  actorUserId: string,
  invoiceId: string,
  nextStatus: "ISSUED" | "SENT" | "PENDING"
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId,
    },
    include: {
      paymentAllocations: true,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  const resolvedStatus = resolveInvoicePaymentStatus(invoice);

  if (resolvedStatus === "PAID" || resolvedStatus === "PARTIALLY_PAID" || resolvedStatus === "CANCELLED") {
    throw new Error("Le statut de cette facture ne peut plus être modifié manuellement.");
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: nextStatus,
      issueDate: nextStatus === "ISSUED" || nextStatus === "SENT" ? invoice.issueDate ?? new Date() : invoice.issueDate,
      sentAt: nextStatus === "SENT" ? invoice.sentAt ?? new Date() : nextStatus === "ISSUED" ? null : invoice.sentAt,
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: updatedInvoice.dossierId,
    invoiceId: updatedInvoice.id,
    entityType: "INVOICE",
    entityId: updatedInvoice.id,
    action: `invoice.status.${nextStatus.toLowerCase()}`,
    description: `Statut de la facture ${updatedInvoice.invoiceNo} mis à jour`,
  });

  return updatedInvoice;
}

export async function cancelInvoice(
  workspaceId: string,
  actorUserId: string,
  invoiceId: string
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId,
    },
    include: {
      paymentAllocations: true,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  if (calculateInvoicePaidAmount(invoice) > 0) {
    throw new Error("Impossible d'annuler une facture avec des règlements enregistrés.");
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "CANCELLED",
      paidAt: null,
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: updatedInvoice.dossierId,
    invoiceId: updatedInvoice.id,
    entityType: "INVOICE",
    entityId: updatedInvoice.id,
    action: "invoice.cancelled",
    description: `Annulation de la facture ${updatedInvoice.invoiceNo}`,
  });

  return updatedInvoice;
}

export async function deleteDraftInvoice(
  workspaceId: string,
  actorUserId: string,
  invoiceId: string
) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId,
    },
    include: {
      paymentAllocations: true,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  if (invoice.status !== "DRAFT") {
    throw new Error("Seules les factures en brouillon peuvent être supprimées.");
  }

  if (calculateInvoicePaidAmount(invoice) > 0) {
    throw new Error("Impossible de supprimer une facture avec des règlements enregistrés.");
  }

  await prisma.invoice.delete({
    where: { id: invoice.id },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: invoice.dossierId,
    entityType: "INVOICE",
    entityId: invoice.id,
    action: "invoice.deleted",
    description: `Suppression du brouillon ${invoice.invoiceNo}`,
  });
}

export async function registerPayment(
  workspaceId: string,
  actorUserId: string,
  input: PaymentInput
) {
  const validatedInput = paymentSchema.parse(input);
  const allocationTotal = validatedInput.allocations.reduce(
    (total, allocation) => total + allocation.amount,
    0
  );
  const uniqueInvoiceIds = new Set(validatedInput.allocations.map((allocation) => allocation.invoiceId));

  if (allocationTotal - validatedInput.amount > 0.001) {
    throw new Error("Le total imputé ne peut pas dépasser le montant encaissé.");
  }

  if (uniqueInvoiceIds.size !== validatedInput.allocations.length) {
    throw new Error("Chaque facture ne peut être imputée qu'une seule fois par règlement.");
  }

  const invoiceIds = validatedInput.allocations.map((allocation) => allocation.invoiceId);

  const invoices = invoiceIds.length
    ? await prisma.invoice.findMany({
        where: {
          workspaceId,
          id: { in: invoiceIds },
        },
        include: {
          dossier: true,
          paymentAllocations: true,
        },
      })
    : [];

  if (invoiceIds.length !== invoices.length) {
    throw new Error("Une ou plusieurs factures sont introuvables.");
  }

  const dossierIds = Array.from(
    new Set(invoices.map((invoice) => invoice.dossierId).filter(Boolean))
  );

  if (dossierIds.length > 1) {
    throw new Error("Un règlement ne peut être rattaché qu'à un seul dossier.");
  }

  const inferredDossierId =
    validatedInput.dossierId ?? invoices[0]?.dossierId ?? null;

  if (
    inferredDossierId &&
    dossierIds.length > 0 &&
    dossierIds.some((dossierId) => dossierId !== inferredDossierId)
  ) {
    throw new Error("Les imputations doivent appartenir au dossier sélectionné.");
  }

  for (const invoice of invoices) {
    const allocatedAmount = validatedInput.allocations
      .filter((allocation) => allocation.invoiceId === invoice.id)
      .reduce((total, allocation) => total + allocation.amount, 0);

    const remainingDue = calculateInvoiceRemainingDue(invoice);

    if (allocatedAmount - remainingDue > 0.001) {
      throw new Error(`Le montant imputé dépasse le solde restant de ${invoice.invoiceNo}.`);
    }
  }

  const payment = await prisma.payment.create({
    data: {
      workspaceId,
      dossierId: inferredDossierId,
      receivedAt: validatedInput.receivedAt,
      amount: validatedInput.amount.toFixed(2),
      method: validatedInput.method,
      reference: validatedInput.reference,
      payerName: validatedInput.payerName,
      notes: validatedInput.notes,
      allocations: validatedInput.allocations.length
        ? {
            create: validatedInput.allocations.map((allocation) => ({
              invoiceId: allocation.invoiceId,
              amount: allocation.amount.toFixed(2),
            })),
          }
        : undefined,
    },
    include: {
      allocations: true,
    },
  });

  for (const invoice of invoices) {
    const matchingNewAllocations = validatedInput.allocations
      .filter((allocation) => allocation.invoiceId === invoice.id)
      .map((allocation) => ({ amount: allocation.amount }));

    const resolvedStatus = resolveInvoicePaymentStatus({
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      paymentAllocations: [...invoice.paymentAllocations, ...matchingNewAllocations],
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: resolvedStatus,
        paidAt: resolvedStatus === "PAID" ? validatedInput.receivedAt : invoice.paidAt,
      },
    });

    await logActivity({
      workspaceId,
      actorUserId,
      dossierId: invoice.dossierId,
      invoiceId: invoice.id,
      paymentId: payment.id,
      entityType: "INVOICE",
      entityId: invoice.id,
      action: "invoice.payment_recorded",
      description: `Règlement enregistré sur la facture ${invoice.invoiceNo}`,
    });
  }

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: inferredDossierId ?? undefined,
    paymentId: payment.id,
    entityType: "PAYMENT",
    entityId: payment.id,
    action: "payment.received",
    description: `Enregistrement d'un paiement de ${validatedInput.amount.toFixed(2)} EUR`,
  });

  return payment;
}

export async function listPayments(
  workspaceId: string,
  options?: { dossierId?: string }
) {
  const payments = await prisma.payment.findMany({
    where: {
      workspaceId,
      dossierId: options?.dossierId,
    },
    include: {
      dossier: true,
      allocations: {
        include: {
          invoice: {
            include: {
              dossier: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
  });

  return payments.map((payment) => {
    const allocatedAmount = calculatePaymentAllocatedAmount(payment);

    return {
      ...payment,
      allocatedAmount,
      unallocatedAmount: ensurePositiveAmount(
        (typeof payment.amount === "number" ? payment.amount : Number(payment.amount) || 0) -
          allocatedAmount
      ),
    };
  });
}
