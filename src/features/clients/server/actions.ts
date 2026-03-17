"use server";

import { requireUserSession } from "@/lib/auth/session";
import { listClients } from "@/features/clients/server/client-repository";

export async function listClientsAction() {
  const session = await requireUserSession();
  return listClients(session.user.workspaceId);
}
