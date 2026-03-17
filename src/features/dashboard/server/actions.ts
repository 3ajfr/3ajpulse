"use server";

import { requireUserSession } from "@/lib/auth/session";
import { getDashboardStats } from "@/features/dashboard/server/dashboard-repository";

export async function getDashboardStatsAction() {
  const session = await requireUserSession();
  return getDashboardStats(session.user.workspaceId);
}
