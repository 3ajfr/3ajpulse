import type { InvoiceStatus, MilestoneStatus } from "@/lib/domain/enums";

type NumericLike = number | string | { toString(): string } | null | undefined;

export interface PaymentAllocationLike {
  amount: NumericLike;
}

export interface InvoiceLike {
  totalAmount: NumericLike;
  status?: InvoiceStatus;
  paymentAllocations?: PaymentAllocationLike[];
}

export interface InvoiceLineLike {
  quantity: NumericLike;
  unitPrice: NumericLike;
  vatRate?: NumericLike;
}

export interface PaymentLike {
  amount: NumericLike;
  allocations?: PaymentAllocationLike[];
}

export interface TimeEntryLike {
  minutes: number;
  hourlyValue?: NumericLike;
}

export interface MilestoneLike {
  title: string;
  dueDate?: Date | string | null;
  status?: MilestoneStatus;
}

function toNumber(value: NumericLike) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }

  if (typeof value === "object" && value !== null) {
    return Number(value.toString());
  }

  return 0;
}

export function sumAmounts(values: NumericLike[]) {
  return values.reduce<number>((total, value) => total + toNumber(value), 0);
}

export function calculateTotalInvoiced(invoices: InvoiceLike[]) {
  return sumAmounts(invoices.map((invoice) => invoice.totalAmount));
}

export function calculateInvoicePaidAmount(invoice: InvoiceLike) {
  return sumAmounts((invoice.paymentAllocations ?? []).map((allocation) => allocation.amount));
}

export function calculateTotalPaid(invoices: InvoiceLike[]) {
  return invoices.reduce((total, invoice) => {
    const paidAmount = calculateInvoicePaidAmount(invoice);

    return total + paidAmount;
  }, 0);
}

export function calculateInvoiceRemainingDue(invoice: InvoiceLike) {
  return Math.max(0, toNumber(invoice.totalAmount) - calculateInvoicePaidAmount(invoice));
}

export function calculateRemainingDue(invoices: InvoiceLike[]) {
  return Math.max(0, calculateTotalInvoiced(invoices) - calculateTotalPaid(invoices));
}

export function calculatePaymentAllocatedAmount(payment: PaymentLike) {
  return sumAmounts((payment.allocations ?? []).map((allocation) => allocation.amount));
}

export function calculateInvoiceLineSubtotal(line: InvoiceLineLike) {
  return toNumber(line.quantity) * toNumber(line.unitPrice);
}

export function calculateInvoiceLineVat(line: InvoiceLineLike) {
  return calculateInvoiceLineSubtotal(line) * (toNumber(line.vatRate) / 100);
}

export function calculateInvoiceTotals(lines: InvoiceLineLike[]) {
  const subtotal = lines.reduce((total, line) => total + calculateInvoiceLineSubtotal(line), 0);
  const vat = lines.reduce((total, line) => total + calculateInvoiceLineVat(line), 0);

  return {
    subtotal,
    vat,
    total: subtotal + vat,
  };
}

export function calculateTotalTrackedTime(entries: TimeEntryLike[]) {
  return entries.reduce((total, entry) => total + entry.minutes, 0);
}

export function calculateTrackedTimeValue(entries: TimeEntryLike[]) {
  return entries.reduce((total, entry) => {
    const hourlyValue = toNumber(entry.hourlyValue);
    const hours = entry.minutes / 60;

    return total + hourlyValue * hours;
  }, 0);
}

export function resolveInvoicePaymentStatus(invoice: InvoiceLike): InvoiceStatus {
  if (invoice.status === "CANCELLED") {
    return "CANCELLED";
  }

  const totalAmount = toNumber(invoice.totalAmount);
  const paidAmount = calculateInvoicePaidAmount(invoice);

  if (paidAmount >= totalAmount && totalAmount > 0) {
    return "PAID";
  }

  if (paidAmount > 0) {
    return "PARTIALLY_PAID";
  }

  if (invoice.status === "DRAFT") {
    return "DRAFT";
  }

  if (invoice.status === "ISSUED" || invoice.status === "SENT" || invoice.status === "PENDING") {
    return invoice.status;
  }

  return "PENDING";
}

export function getNextMilestone(milestones: MilestoneLike[]) {
  const now = new Date().getTime();

  return milestones
    .filter((milestone) => milestone.status !== "DONE" && milestone.status !== "CANCELLED")
    .filter((milestone) => milestone.dueDate)
    .map((milestone) => ({
      ...milestone,
      dueAt: new Date(milestone.dueDate as Date | string).getTime(),
    }))
    .filter((milestone) => !Number.isNaN(milestone.dueAt))
    .sort((left, right) => {
      const leftIsPast = left.dueAt < now ? 0 : 1;
      const rightIsPast = right.dueAt < now ? 0 : 1;

      if (leftIsPast !== rightIsPast) {
        return leftIsPast - rightIsPast;
      }

      return left.dueAt - right.dueAt;
    })[0];
}

export function calculateDossierProgressHeuristic(input: {
  phaseOrder: string[];
  currentPhase: string;
  milestones: MilestoneLike[];
  tasks: Array<{ status: string }>;
}) {
  const phaseIndex = Math.max(0, input.phaseOrder.indexOf(input.currentPhase));
  const phaseProgress =
    input.phaseOrder.length > 1 ? phaseIndex / (input.phaseOrder.length - 1) : 0;

  const totalMilestones = input.milestones.length;
  const completedMilestones = input.milestones.filter(
    (milestone) => milestone.status === "DONE"
  ).length;
  const milestoneProgress =
    totalMilestones > 0 ? completedMilestones / totalMilestones : 0;

  const totalTasks = input.tasks.length;
  const completedTasks = input.tasks.filter((task) => task.status === "DONE").length;
  const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const score = phaseProgress * 0.5 + milestoneProgress * 0.3 + taskProgress * 0.2;

  return Math.max(0, Math.min(100, Math.round(score * 100)));
}
