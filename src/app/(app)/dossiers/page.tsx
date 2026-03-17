import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { DossiersTable } from "@/features/dossiers/ui/dossiers-table";
import { listDossiersAction } from "@/features/dossiers/server/actions";
import { FolderPlus } from "lucide-react";

function DossiersTableFallback() {
  return (
    <div className="animate-pulse rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-8">
      <div className="mb-4 h-9 w-64 rounded-lg bg-[var(--border-subtle)]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-[var(--border-subtle)]"
          />
        ))}
      </div>
    </div>
  );
}

export default async function DossiersPage() {
  const dossiers = await listDossiersAction();

  const rows = dossiers.map((d) => ({
    id: d.id,
    reference: d.reference,
    title: d.title,
    status: d.status,
    phase: d.phase,
    client: d.client,
    totalFeeAmount: d.totalFeeAmount ?? 0,
    totalPaid: d.totalPaid ?? 0,
    nextMilestone: d.nextMilestone,
  }));

  return (
    <PageContainer>
      <SectionHeader
        title="Dossiers"
        description="Tous les dossiers et maîtrises d'œuvre"
        action={
          <ButtonLink href="/dossiers/new" variant="primary" size="md">
            <FolderPlus className="h-4 w-4" />
            Nouveau dossier
          </ButtonLink>
        }
      />
      <div className="mt-6">
        <Suspense fallback={<DossiersTableFallback />}>
          <DossiersTable dossiers={rows} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
