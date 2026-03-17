import { PageContainer } from "@/components/layout/page-container";

export default function PaymentsLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse space-y-6">
        <div className="flex h-10 items-center justify-between gap-4">
          <div className="h-8 w-40 rounded-lg bg-[var(--border-subtle)]" />
          <div className="h-9 w-36 rounded-lg bg-[var(--border-subtle)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--border-subtle)]" />
          <div className="h-24 rounded-[var(--radius-card)] bg-[var(--border-subtle)]" />
        </div>
        <div className="h-64 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
      </div>
    </PageContainer>
  );
}
