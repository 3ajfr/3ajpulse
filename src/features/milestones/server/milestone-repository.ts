import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity/log-activity";
import {
  milestoneSchema,
  type MilestoneInput,
} from "@/features/milestones/validation/milestone-schemas";
import type { BusinessPhase } from "@/lib/domain/enums";

export interface ListMilestonesFilters {
  dossierId?: string;
  phase?: string;
  status?: string;
  dueBefore?: string;
  dueAfter?: string;
}

export async function listMilestones(
  workspaceId: string,
  filters?: ListMilestonesFilters
) {
  const phaseFilter = filters?.phase as BusinessPhase | undefined;
  const milestones = await prisma.milestone.findMany({
    where: {
      workspaceId,
      ...(filters?.dossierId && { dossierId: filters.dossierId }),
      ...(phaseFilter && {
        OR: [
          { phase: phaseFilter },
          { phase: null, dossier: { phase: phaseFilter } },
        ],
      }),
      ...(filters?.status && {
        status: filters.status as "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED",
      }),
      ...((filters?.dueBefore || filters?.dueAfter) && {
        dueDate: {
          ...(filters.dueBefore && { lte: new Date(filters.dueBefore) }),
          ...(filters.dueAfter && { gte: new Date(filters.dueAfter) }),
        },
      }),
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true, phase: true } },
    },
    orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return milestones;
}

export async function getMilestoneById(
  workspaceId: string,
  milestoneId: string
) {
  return prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      workspaceId,
    },
    include: {
      dossier: true,
    },
  });
}

export async function createMilestone(
  workspaceId: string,
  actorUserId: string,
  input: MilestoneInput
) {
  const validatedInput = milestoneSchema.parse(input);

  const dossier = await prisma.dossier.findFirst({
    where: { id: validatedInput.dossierId, workspaceId },
  });

  if (!dossier) return null;

  const milestone = await prisma.milestone.create({
    data: {
      workspaceId,
      dossierId: validatedInput.dossierId,
      title: validatedInput.title,
      description: validatedInput.description ?? null,
      status: validatedInput.status,
      dueDate: validatedInput.dueDate ?? null,
      phase: validatedInput.phase ?? null,
      sortOrder: validatedInput.sortOrder,
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true } },
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: milestone.dossierId,
    entityType: "MILESTONE",
    entityId: milestone.id,
    action: "milestone.created",
    description: `Création du jalon « ${milestone.title} »`,
  });

  return milestone;
}

export async function updateMilestone(
  workspaceId: string,
  actorUserId: string,
  milestoneId: string,
  input: MilestoneInput
) {
  const validatedInput = milestoneSchema.parse(input);

  const existing = await prisma.milestone.findFirst({
    where: { id: milestoneId, workspaceId },
  });

  if (!existing) return null;

  const dossier = await prisma.dossier.findFirst({
    where: { id: validatedInput.dossierId, workspaceId },
  });

  if (!dossier) return null;

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      dossierId: validatedInput.dossierId,
      title: validatedInput.title,
      description: validatedInput.description ?? null,
      status: validatedInput.status,
      dueDate: validatedInput.dueDate ?? null,
      phase: validatedInput.phase ?? null,
      sortOrder: validatedInput.sortOrder,
      completedAt:
        validatedInput.status === "DONE" ? new Date() : null,
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true } },
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: milestone.dossierId,
    entityType: "MILESTONE",
    entityId: milestone.id,
    action: "milestone.updated",
    description: `Mise à jour du jalon « ${milestone.title} »`,
  });

  return milestone;
}

export async function markMilestoneComplete(
  workspaceId: string,
  actorUserId: string,
  milestoneId: string
) {
  const existing = await prisma.milestone.findFirst({
    where: { id: milestoneId, workspaceId },
  });

  if (!existing) return null;

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "DONE",
      completedAt: new Date(),
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true } },
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: milestone.dossierId,
    entityType: "MILESTONE",
    entityId: milestone.id,
    action: "milestone.completed",
    description: `Jalon « ${milestone.title} » marqué comme terminé`,
  });

  return milestone;
}
