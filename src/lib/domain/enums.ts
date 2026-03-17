export const userRoles = ["OWNER", "MANAGER", "FINANCE", "MEMBER"] as const;

export const dossierStatuses = [
  "ACTIVE",
  "DORMANT",
  "ARCHIVED",
  "CANCELLED",
] as const;

export const businessPhases = [
  "PROSPECTION",
  "CLOSING",
  "LCA",
  "LCMP",
  "LCSC",
  "CHANTIER",
  "RECEPTION",
] as const;

export const missionTypes = ["LCA", "LCMP", "LCSC"] as const;

export const taskStatuses = [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "CANCELLED",
] as const;

export const milestoneStatuses = [
  "PLANNED",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
] as const;

export const competences = [
  "ARCHITECTURE",
  "INTERIOR_ARCHITECTURE",
  "PROJECT_PILOTAGE",
  "MAITRE_OEUVRE",
  "RELEVE",
  "DESSINATEUR",
  "GESTION",
  "PROSPECTION",
  "CLOSING",
  "SAV",
] as const;

export const invoiceStatuses = [
  "DRAFT",
  "ISSUED",
  "SENT",
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "CANCELLED",
] as const;

export const invoiceTypes = [
  "MISSION",
  "TIME_BASED",
  "DEPOSIT",
  "INTERMEDIATE",
  "BALANCE",
] as const;

export const paymentMethods = [
  "TRANSFER",
  "CARD",
  "CHEQUE",
  "CASH",
  "OTHER",
] as const;

export type UserRole = (typeof userRoles)[number];
export type DossierStatus = (typeof dossierStatuses)[number];
export type BusinessPhase = (typeof businessPhases)[number];
export type MissionType = (typeof missionTypes)[number];
export type TaskStatus = (typeof taskStatuses)[number];
export type MilestoneStatus = (typeof milestoneStatuses)[number];
export type Competence = (typeof competences)[number];
export type InvoiceStatus = (typeof invoiceStatuses)[number];
export type InvoiceType = (typeof invoiceTypes)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
