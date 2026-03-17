import { AppShell } from "@/components/layout/app-shell";
import { requireUserSession } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserSession();

  return <AppShell>{children}</AppShell>;
}
