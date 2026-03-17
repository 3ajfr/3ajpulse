import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUserSession() {
  const session = await auth();

  if (!session?.user?.id || !session.user.workspaceId || !session.user.role) {
    redirect("/sign-in");
  }

  return session;
}

export async function getOptionalSession() {
  return auth();
}
