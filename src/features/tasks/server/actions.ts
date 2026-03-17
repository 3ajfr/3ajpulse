"use server";

import { requireUserSession } from "@/lib/auth/session";
import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  markTaskComplete,
  listWorkspaceMembers,
} from "@/features/tasks/server/task-repository";
import type { TaskInput } from "@/features/tasks/validation/task-schemas";
import type { ListTasksFilters } from "@/features/tasks/server/task-repository";

export async function listTasksAction(filters?: ListTasksFilters) {
  const session = await requireUserSession();
  return listTasks(session.user.workspaceId, filters);
}

export async function getTaskAction(taskId: string) {
  const session = await requireUserSession();
  return getTaskById(session.user.workspaceId, taskId);
}

export async function createTaskAction(input: TaskInput) {
  const session = await requireUserSession();
  return createTask(session.user.workspaceId, session.user.id, input);
}

export async function updateTaskAction(taskId: string, input: TaskInput) {
  const session = await requireUserSession();
  return updateTask(session.user.workspaceId, session.user.id, taskId, input);
}

export async function markTaskCompleteAction(taskId: string) {
  const session = await requireUserSession();
  return markTaskComplete(session.user.workspaceId, session.user.id, taskId);
}

export async function listWorkspaceMembersAction() {
  const session = await requireUserSession();
  return listWorkspaceMembers(session.user.workspaceId);
}
