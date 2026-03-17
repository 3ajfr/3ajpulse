import { prisma } from "@/lib/db";
import {
  calculateRemainingDue,
  resolveInvoicePaymentStatus,
} from "@/lib/business/calculations";
import { addDays, startOfMonth, endOfMonth } from "date-fns";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && "toString" in value) {
    return Number((value as { toString(): string }).toString()) || 0;
  }
  return 0;
}

export async function getDashboardStats(workspaceId: string) {
  const now = new Date();
  const weekFromNow = addDays(now, 7);
  const monthEnd = endOfMonth(now);
  const monthStart = startOfMonth(now);

  const [dossiers, invoices, tasks, milestones, payments, timeEntries] =
    await Promise.all([
      prisma.dossier.findMany({
        where: { workspaceId },
        include: {
          client: true,
          invoices: { include: { paymentAllocations: true } },
          tasks: true,
          milestones: true,
        },
      }),
      prisma.invoice.findMany({
        where: { workspaceId },
        include: {
          dossier: true,
          paymentAllocations: true,
        },
      }),
      prisma.task.findMany({
        where: {
          workspaceId,
          status: { in: ["TODO", "IN_PROGRESS"] },
          dueDate: { lte: weekFromNow, not: null },
        },
        include: { dossier: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.milestone.findMany({
        where: {
          workspaceId,
          status: { in: ["PLANNED", "IN_PROGRESS"] },
          dueDate: { gte: now, lte: monthEnd, not: null },
        },
        include: { dossier: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.payment.findMany({
        where: { workspaceId },
      }),
      prisma.timeEntry.findMany({
        where: {
          workspaceId,
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

  const totalCollected = payments.reduce(
    (sum, p) => sum + toNumber(p.amount),
    0
  );

  const invoicesWithStatus = invoices.map((inv) => ({
    ...inv,
    resolvedStatus: resolveInvoicePaymentStatus(inv),
    remainingDue: calculateRemainingDue([inv]),
  }));

  const totalRemaining = invoicesWithStatus.reduce(
    (sum, inv) => sum + inv.remainingDue,
    0
  );

  const invoicesAwaitingPayment = invoicesWithStatus.filter((inv) =>
    ["PENDING", "PARTIALLY_PAID", "SENT"].includes(inv.resolvedStatus)
  ).length;

  const overdueInvoices = invoicesWithStatus.filter((inv) => {
    if (inv.resolvedStatus === "PAID" || inv.resolvedStatus === "CANCELLED")
      return false;
    const due = inv.dueDate ? new Date(inv.dueDate) : null;
    return due && due < now;
  }).length;

  const activeDossiers = dossiers.filter((d) => d.status === "ACTIVE").length;
  const prospectionCount = dossiers.filter(
    (d) => d.phase === "PROSPECTION" && d.status === "ACTIVE"
  ).length;
  const closingCount = dossiers.filter(
    (d) => d.phase === "CLOSING" && d.status === "ACTIVE"
  ).length;

  const totalMinutesThisMonth = timeEntries.reduce(
    (sum, e) => sum + e.minutes,
    0
  );

  return {
    kpis: {
      activeDossiers,
      prospectionCount,
      closingCount,
      totalCollected,
      totalRemaining,
      invoicesAwaitingPayment,
      overdueInvoices,
      totalMinutesThisMonth,
    },
    activeDossiersList: dossiers
      .filter((d) => d.status === "ACTIVE")
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        reference: d.reference,
        title: d.title,
        phase: d.phase,
        clientName: d.client?.name ?? "",
      })),
    urgentTasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      status: t.status,
      dossierReference: t.dossier?.reference ?? "",
      dossierId: t.dossierId,
    })),
    upcomingMilestones: milestones.map((m) => ({
      id: m.id,
      title: m.title,
      dueDate: m.dueDate,
      status: m.status,
      dossierReference: m.dossier?.reference ?? "",
      dossierId: m.dossierId,
    })),
    invoicesAwaitingList: invoicesWithStatus
      .filter((inv) =>
        ["PENDING", "PARTIALLY_PAID", "SENT"].includes(inv.resolvedStatus)
      )
      .slice(0, 5)
      .map((inv) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        totalAmount: toNumber(inv.totalAmount),
        remainingDue: inv.remainingDue,
        dueDate: inv.dueDate,
        dossierReference: inv.dossier?.reference ?? "",
      })),
  };
}
