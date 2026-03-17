"use server";

import { requireUserSession } from "@/lib/auth/session";
import {
  createTimeEntry,
  listTimeEntriesByDossier,
} from "@/features/time/server/time-repository";
import type { TimeEntryInput } from "@/features/time/validation/time-entry-schemas";

export async function listTimeEntriesByDossierAction(dossierId: string) {
  const session = await requireUserSession();

  return listTimeEntriesByDossier(session.user.workspaceId, dossierId);
}

export async function createTimeEntryAction(input: TimeEntryInput) {
  const session = await requireUserSession();

  return createTimeEntry(session.user.workspaceId, session.user.id, input);
}
