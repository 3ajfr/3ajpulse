import { PageContainer } from "@/components/layout/page-container";

export default function DashboardLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 rounded-lg bg-[var(--border-subtle)]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
            />
          ))}
        </div>
        <div className="h-48 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
      </div>
    </PageContainer>
  );
}
