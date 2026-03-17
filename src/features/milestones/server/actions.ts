"use server";

import { requireUserSession } from "@/lib/auth/session";
import {
  listMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  markMilestoneComplete,
} from "@/features/milestones/server/milestone-repository";
import type { MilestoneInput } from "@/features/milestones/validation/milestone-schemas";
import type { ListMilestonesFilters } from "@/features/milestones/server/milestone-repository";

export async function listMilestonesAction(filters?: ListMilestonesFilters) {
  const session = await requireUserSession();
  return listMilestones(session.user.workspaceId, filters);
}

export async function getMilestoneAction(milestoneId: string) {
  const session = await requireUserSession();
  return getMilestoneById(session.user.workspaceId, milestoneId);
}

export async function createMilestoneAction(input: MilestoneInput) {
  const session = await requireUserSession();
  return createMilestone(session.user.workspaceId, session.user.id, input);
}

export async function updateMilestoneAction(
  milestoneId: string,
  input: MilestoneInput
) {
  const session = await requireUserSession();
  return updateMilestone(
    session.user.workspaceId,
    session.user.id,
    milestoneId,
    input
  );
}

export async function markMilestoneCompleteAction(milestoneId: string) {
  const session = await requireUserSession();
  return markMilestoneComplete(
    session.user.workspaceId,
    session.user.id,
    milestoneId
  );
}
