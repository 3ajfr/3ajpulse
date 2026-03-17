import { PageContainer } from "@/components/layout/page-container";

export default function TasksLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 rounded bg-[var(--border-subtle)]" />
        <div className="h-9 w-64 rounded bg-[var(--border-subtle)]" />
        <div className="h-64 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
      </div>
    </PageContainer>
  );
}
