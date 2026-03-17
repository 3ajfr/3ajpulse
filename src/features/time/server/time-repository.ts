import { prisma } from "@/lib/db";
import {
  calculateTotalTrackedTime,
  calculateTrackedTimeValue,
} from "@/lib/business/calculations";
import { logActivity } from "@/lib/activity/log-activity";
import {
  timeEntrySchema,
  type TimeEntryInput,
} from "@/features/time/validation/time-entry-schemas";

export async function listTimeEntriesByDossier(workspaceId: string, dossierId: string) {
  const entries = await prisma.timeEntry.findMany({
    where: {
      workspaceId,
      dossierId,
    },
    include: {
      user: true,
      missionFee: true,
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return {
    entries,
    totalMinutes: calculateTotalTrackedTime(entries),
    totalValue: calculateTrackedTimeValue(entries),
  };
}

export async function createTimeEntry(
  workspaceId: string,
  actorUserId: string,
  input: TimeEntryInput
) {
  const validatedInput = timeEntrySchema.parse(input);

  const entry = await prisma.timeEntry.create({
    data: {
      workspaceId,
      dossierId: validatedInput.dossierId,
      missionFeeId: validatedInput.missionFeeId,
      userId: actorUserId,
      date: validatedInput.date,
      minutes: validatedInput.minutes,
      competence: validatedInput.competence,
      note: validatedInput.note,
      billable: validatedInput.billable,
      hourlyValue:
        typeof validatedInput.hourlyValue === "number"
          ? validatedInput.hourlyValue.toFixed(2)
          : null,
    },
  });

  await logActivity({
    workspaceId,
    actorUserId,
    dossierId: entry.dossierId,
    entityType: "DOSSIER",
    entityId: entry.dossierId,
    action: "time_entry.created",
    description: `Ajout d'un suivi de temps de ${validatedInput.minutes} minutes`,
  });

  return entry;
}
