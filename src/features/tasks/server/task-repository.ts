import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity/log-activity";
import {
  taskSchema,
  type TaskInput,
} from "@/features/tasks/validation/task-schemas";
import type { BusinessPhase } from "@/lib/domain/enums";

export interface ListTasksFilters {
  dossierId?: string;
  phase?: string;
  status?: string;
  assignedToUserId?: string;
  dueBefore?: string; // ISO date
  dueAfter?: string; // ISO date
}

export async function listTasks(
  workspaceId: string,
  filters?: ListTasksFilters
) {
  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
      ...(filters?.dossierId && { dossierId: filters.dossierId }),
      ...(filters?.phase && { dossier: { phase: filters.phase as BusinessPhase } }),
      ...(filters?.status && { status: filters.status as "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED" }),
      ...(filters?.assignedToUserId && { assignedToUserId: filters.assignedToUserId }),
      ...((filters?.dueBefore || filters?.dueAfter) && {
        dueDate: {
          ...(filters.dueBefore && { lte: new Date(filters.dueBefore) }),
          ...(filters.dueAfter && { gte: new Date(filters.dueAfter) }),
        },
      }),
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true, phase: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  return tasks;
}

export async function getTaskById(workspaceId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
    },
    include: {
      dossier: true,
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
}

export async function createTask(
  workspaceId: string,
  actorUserId: string,
  input: TaskInput
) {
  const validatedInput = taskSchema.parse(input);

  const dossier = await prisma.dossier.findFirst({
    where: { id: validatedInput.dossierId, workspaceId },
  });

  if (!dossier) return null;

  const task = await prisma.task.create({
    data: {
      workspaceId,
      dossierId: validatedInput.dossierId,
      title: validatedInput.title,
      description: validatedInput.description ?? null,
      status: validatedInput.status,
      dueDate: validatedInput.dueDate ?? null,
      priority: validatedInput.priority,
      assignedToUserId: validatedInput.assignedToUserId ?? null,
      createdByUserId: actorUserId,
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: task.dossierId,
    entityType: "TASK",
    entityId: task.id,
    action: "task.created",
    description: `Création de la tâche « ${task.title} »`,
  });

  return task;
}

export async function updateTask(
  workspaceId: string,
  actorUserId: string,
  taskId: string,
  input: TaskInput
) {
  const validatedInput = taskSchema.parse(input);

  const existing = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
  });

  if (!existing) return null;

  const dossier = await prisma.dossier.findFirst({
    where: { id: validatedInput.dossierId, workspaceId },
  });

  if (!dossier) return null;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      dossierId: validatedInput.dossierId,
      title: validatedInput.title,
      description: validatedInput.description ?? null,
      status: validatedInput.status,
      dueDate: validatedInput.dueDate ?? null,
      priority: validatedInput.priority,
      assignedToUserId: validatedInput.assignedToUserId ?? null,
      completedAt:
        validatedInput.status === "DONE" ? new Date() : null,
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: task.dossierId,
    entityType: "TASK",
    entityId: task.id,
    action: "task.updated",
    description: `Mise à jour de la tâche « ${task.title} »`,
  });

  return task;
}

export async function markTaskComplete(
  workspaceId: string,
  actorUserId: string,
  taskId: string
) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
  });

  if (!existing) return null;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "DONE",
      completedAt: new Date(),
    },
    include: {
      dossier: { select: { id: true, reference: true, title: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: task.dossierId,
    entityType: "TASK",
    entityId: task.id,
    action: "task.completed",
    description: `Tâche « ${task.title} » marquée comme terminée`,
  });

  return task;
}

export async function listWorkspaceMembers(workspaceId: string) {
  const memberships = await prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email ?? "",
  }));
}
