import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  topbar?: React.ReactNode;
}

export function AppShell({ children, topbar }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--surface)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
