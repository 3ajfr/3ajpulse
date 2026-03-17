import type {
  InvoiceStatus,
  InvoiceType,
  MissionType,
  PaymentMethod,
} from "@/lib/domain/enums";

export type BadgeVariant = "success" | "warning" | "error" | "neutral" | "info" | "outline";

type NumericLike = number | string | { toString(): string } | null | undefined;

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Brouillon",
  ISSUED: "Émise",
  SENT: "Envoyée",
  PENDING: "En attente",
  PARTIALLY_PAID: "Partiellement payée",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  MISSION: "Mission",
  TIME_BASED: "Temps passé",
  DEPOSIT: "Acompte",
  INTERMEDIATE: "Intermédiaire",
  BALANCE: "Solde",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  TRANSFER: "Virement",
  CARD: "Carte",
  CHEQUE: "Chèque",
  CASH: "Espèces",
  OTHER: "Autre",
};

export const missionTypeLabels: Record<MissionType, string> = {
  LCA: "LCA",
  LCMP: "LCMP",
  LCSC: "LCSC",
};

export function toNumber(value: NumericLike) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value) || 0;
  }

  if (typeof value === "object" && value !== null) {
    return Number(value.toString()) || 0;
  }

  return 0;
}

export function getInvoiceStatusVariant(status: InvoiceStatus): BadgeVariant {
  if (status === "PAID") return "success";
  if (status === "PARTIALLY_PAID" || status === "PENDING") return "warning";
  if (status === "ISSUED" || status === "SENT") return "info";
  if (status === "CANCELLED") return "neutral";

  return "neutral";
}

export function isInvoiceOverdue(input: {
  status: InvoiceStatus;
  dueDate?: Date | string | null;
}) {
  if (
    input.status === "PAID" ||
    input.status === "CANCELLED" ||
    input.status === "DRAFT"
  ) {
    return false;
  }

  if (!input.dueDate) {
    return false;
  }

  const dueDate = typeof input.dueDate === "string" ? new Date(input.dueDate) : input.dueDate;
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

export function getInvoiceStatusTone(input: {
  status: InvoiceStatus;
  dueDate?: Date | string | null;
}) {
  if (isInvoiceOverdue(input)) {
    return {
      label: "En retard",
      variant: "error" as BadgeVariant,
    };
  }

  return {
    label: invoiceStatusLabels[input.status],
    variant: getInvoiceStatusVariant(input.status),
  };
}

export function formatPercent(value: number) {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} %`;
}
