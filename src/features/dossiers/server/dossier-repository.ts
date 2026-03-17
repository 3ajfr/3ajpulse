import { prisma } from "@/lib/db";
import {
  calculateDossierProgressHeuristic,
  calculateRemainingDue,
  calculateTotalInvoiced,
  calculateTotalPaid,
  calculateTotalTrackedTime,
  calculateTrackedTimeValue,
  getNextMilestone,
} from "@/lib/business/calculations";
import { logActivity } from "@/lib/activity/log-activity";
import {
  dossierSchema,
  type DossierInput,
} from "@/features/dossiers/validation/dossier-schemas";
import { businessPhases } from "@/lib/domain/enums";

export async function listDossiersForSelect(workspaceId: string) {
  return prisma.dossier.findMany({
    where: { workspaceId },
    select: { id: true, reference: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listDossiers(workspaceId: string) {
  const dossiers = await prisma.dossier.findMany({
    where: { workspaceId },
    include: {
      client: true,
      missions: true,
      milestones: {
        orderBy: { dueDate: "asc" },
      },
      invoices: {
        include: {
          paymentAllocations: true,
        },
      },
      timeEntries: true,
      tasks: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  function toNum(v: unknown): number {
    if (typeof v === "number") return v;
    if (typeof v === "string") return Number(v) || 0;
    if (v && typeof v === "object" && "toString" in v)
      return Number((v as { toString(): string }).toString()) || 0;
    return 0;
  }

  return dossiers.map((dossier) => {
    const totalFeeAmount = dossier.missions.reduce(
      (sum, m) => sum + toNum(m.feeAmount),
      0
    );
    return {
      ...dossier,
      totalFeeAmount,
      nextMilestone: getNextMilestone(dossier.milestones),
      totalInvoiced: calculateTotalInvoiced(dossier.invoices),
      totalPaid: calculateTotalPaid(dossier.invoices),
      remainingDue: calculateRemainingDue(dossier.invoices),
      totalTrackedTimeMinutes: calculateTotalTrackedTime(dossier.timeEntries),
      trackedTimeValue: calculateTrackedTimeValue(dossier.timeEntries),
      progress: calculateDossierProgressHeuristic({
      phaseOrder: [...businessPhases],
      currentPhase: dossier.phase,
      milestones: dossier.milestones,
      tasks: dossier.tasks,
    }),
    };
  });
}

export async function getDossierById(workspaceId: string, dossierId: string) {
  const dossier = await prisma.dossier.findFirst({
    where: {
      id: dossierId,
      workspaceId,
    },
    include: {
      client: true,
      contacts: {
        include: {
          contact: true,
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
      residenceInfo: true,
      chantierInfo: true,
      adminInfo: true,
      tasks: {
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
      milestones: {
        orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }],
      },
      missions: {
        orderBy: { type: "asc" },
      },
      timeEntries: {
        orderBy: { date: "desc" },
      },
      invoices: {
        include: {
          lines: true,
          paymentAllocations: true,
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        include: {
          allocations: {
            include: {
              invoice: true,
            },
          },
        },
        orderBy: { receivedAt: "desc" },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!dossier) {
    return null;
  }

  const totalFeeAmount = dossier.missions.reduce(
    (sum, m) => sum + (typeof m.feeAmount === "number" ? m.feeAmount : Number(m.feeAmount) || 0),
    0
  );

  return {
    ...dossier,
    totalFeeAmount,
    nextMilestone: getNextMilestone(dossier.milestones),
    totalInvoiced: calculateTotalInvoiced(dossier.invoices),
    totalPaid: calculateTotalPaid(dossier.invoices),
    remainingDue: calculateRemainingDue(dossier.invoices),
    totalTrackedTimeMinutes: calculateTotalTrackedTime(dossier.timeEntries),
    trackedTimeValue: calculateTrackedTimeValue(dossier.timeEntries),
    progress: calculateDossierProgressHeuristic({
      phaseOrder: [...businessPhases],
      currentPhase: dossier.phase,
      milestones: dossier.milestones,
      tasks: dossier.tasks,
    }),
  };
}

export async function updateDossier(
  workspaceId: string,
  actorUserId: string,
  dossierId: string,
  input: DossierInput
) {
  const validatedInput = dossierSchema.parse(input);

  const existing = await prisma.dossier.findFirst({
    where: { id: dossierId, workspaceId },
    include: { residenceInfo: true, chantierInfo: true, adminInfo: true },
  });

  if (!existing) return null;

  const dossier = await prisma.dossier.update({
    where: { id: dossierId },
    data: {
      clientId: validatedInput.clientId,
      reference: validatedInput.reference,
      title: validatedInput.title,
      description: validatedInput.description,
      status: validatedInput.status,
      phase: validatedInput.phase,
      priority: validatedInput.priority,
      city: validatedInput.city,
      postalCode: validatedInput.postalCode,
      country: validatedInput.country,
      addressLine1: validatedInput.addressLine1,
      addressLine2: validatedInput.addressLine2,
      projectLabel: validatedInput.projectLabel,
      startDate: validatedInput.startDate,
      closingDate: validatedInput.closingDate,
      chantierStartDate: validatedInput.chantierStartDate,
      receptionDate: validatedInput.receptionDate,
      notes: validatedInput.notes,
      contacts: validatedInput.contacts.length
        ? {
            deleteMany: {},
            create: validatedInput.contacts.map((c) => ({
              contactId: c.contactId,
              roleLabel: c.roleLabel,
              isPrimary: c.isPrimary,
            })),
          }
        : { deleteMany: {} },
      residenceInfo: validatedInput.residenceInfo
        ? {
            upsert: {
              create: validatedInput.residenceInfo,
              update: validatedInput.residenceInfo,
            },
          }
        : existing.residenceInfo
          ? { delete: true }
          : undefined,
      chantierInfo: validatedInput.chantierInfo
        ? {
            upsert: {
              create: validatedInput.chantierInfo,
              update: validatedInput.chantierInfo,
            },
          }
        : existing.chantierInfo
          ? { delete: true }
          : undefined,
      adminInfo: validatedInput.adminInfo
        ? {
            upsert: {
              create: validatedInput.adminInfo,
              update: validatedInput.adminInfo,
            },
          }
        : existing.adminInfo
          ? { delete: true }
          : undefined,
      missions: validatedInput.missions.length
        ? {
            deleteMany: {},
            create: validatedInput.missions,
          }
        : { deleteMany: {} },
    },
    include: {
      client: true,
      missions: true,
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId,
    entityType: "DOSSIER",
    entityId: dossierId,
    action: "dossier.updated",
    description: `Mise à jour du dossier ${dossier.reference}`,
  });

  return dossier;
}

export async function createDossier(
  workspaceId: string,
  actorUserId: string,
  input: DossierInput
) {
  const validatedInput = dossierSchema.parse(input);

  const dossier = await prisma.dossier.create({
    data: {
      workspaceId,
      clientId: validatedInput.clientId,
      reference: validatedInput.reference,
      title: validatedInput.title,
      description: validatedInput.description,
      status: validatedInput.status,
      phase: validatedInput.phase,
      priority: validatedInput.priority,
      city: validatedInput.city,
      postalCode: validatedInput.postalCode,
      country: validatedInput.country,
      addressLine1: validatedInput.addressLine1,
      addressLine2: validatedInput.addressLine2,
      projectLabel: validatedInput.projectLabel,
      startDate: validatedInput.startDate,
      closingDate: validatedInput.closingDate,
      chantierStartDate: validatedInput.chantierStartDate,
      receptionDate: validatedInput.receptionDate,
      notes: validatedInput.notes,
      contacts: validatedInput.contacts.length
        ? {
            create: validatedInput.contacts.map((contact) => ({
              contactId: contact.contactId,
              roleLabel: contact.roleLabel,
              isPrimary: contact.isPrimary,
            })),
          }
        : undefined,
      residenceInfo: validatedInput.residenceInfo
        ? {
            create: validatedInput.residenceInfo,
          }
        : undefined,
      chantierInfo: validatedInput.chantierInfo
        ? {
            create: validatedInput.chantierInfo,
          }
        : undefined,
      adminInfo: validatedInput.adminInfo
        ? {
            create: validatedInput.adminInfo,
          }
        : undefined,
      missions: validatedInput.missions.length
        ? {
            create: validatedInput.missions,
          }
        : undefined,
    },
    include: {
      client: true,
      missions: true,
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: dossier.id,
    entityType: "DOSSIER",
    entityId: dossier.id,
    action: "dossier.created",
    description: `Création du dossier ${dossier.reference}`,
  });

  return dossier;
}
