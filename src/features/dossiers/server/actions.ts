"use server";

import { requireUserSession } from "@/lib/auth/session";
import {
  createDossier,
  getDossierById,
  listDossiers,
  listDossiersForSelect,
  updateDossier,
} from "@/features/dossiers/server/dossier-repository";
import type { DossierInput } from "@/features/dossiers/validation/dossier-schemas";

export async function listDossiersAction() {
  const session = await requireUserSession();

  return listDossiers(session.user.workspaceId);
}

export async function listDossiersForSelectAction() {
  const session = await requireUserSession();

  return listDossiersForSelect(session.user.workspaceId);
}

export async function getDossierAction(dossierId: string) {
  const session = await requireUserSession();

  return getDossierById(session.user.workspaceId, dossierId);
}

export async function createDossierAction(input: DossierInput) {
  const session = await requireUserSession();

  return createDossier(session.user.workspaceId, session.user.id, input);
}

export async function updateDossierAction(dossierId: string, input: DossierInput) {
  const session = await requireUserSession();

  return updateDossier(
    session.user.workspaceId,
    session.user.id,
    dossierId,
    input
  );
}
