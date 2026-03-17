import { PageContainer } from "@/components/layout/page-container";

export default function SettingsLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 rounded-lg bg-[var(--border-subtle)]" />
        <div className="h-48 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]" />
      </div>
    </PageContainer>
  );
}
