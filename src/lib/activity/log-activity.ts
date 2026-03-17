import { prisma } from "@/lib/db";
import type { ActivityEntityType } from "@/generated/prisma/enums";

interface LogActivityInput {
  workspaceId: string;
  actorUserId?: string;
  dossierId?: string;
  invoiceId?: string;
  paymentId?: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  description: string;
  payload?: object;
}

export async function logActivity(input: LogActivityInput) {
  return prisma.activityEvent.create({
    data: {
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      dossierId: input.dossierId,
      invoiceId: input.invoiceId,
      paymentId: input.paymentId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      description: input.description,
      payload: input.payload,
    },
  });
}
