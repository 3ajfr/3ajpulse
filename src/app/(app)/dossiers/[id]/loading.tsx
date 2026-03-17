import { PageContainer } from "@/components/layout/page-container";

export default function DossierDetailLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between">
          <div className="h-4 w-48 rounded bg-[var(--border-subtle)]" />
          <div className="h-8 w-24 rounded bg-[var(--border-subtle)]" />
        </div>
        <div className="h-28 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]"
            />
          ))}
        </div>
        <div className="h-48 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
        <div className="h-48 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
        <div className="h-40 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
        <div className="h-32 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
      </div>
    </PageContainer>
  );
}
