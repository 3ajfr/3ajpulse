import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { MilestonesTable } from "@/features/milestones/ui/milestones-table";
import { listMilestonesAction } from "@/features/milestones/server/actions";
import { Plus } from "lucide-react";

function MilestonesTableFallback() {
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

export default async function MilestonesPage({
  searchParams,
}: {
  searchParams: Promise<{ dossier?: string; phase?: string; status?: string }>;
}) {
  const params = await searchParams;
  const milestones = await listMilestonesAction({
    dossierId: params.dossier || undefined,
    phase: params.phase || undefined,
    status: params.status || undefined,
  });

  type MilestoneWithRelations = (typeof milestones)[number] & {
    dossier?: { id: string; reference: string; title: string; phase: string };
  };
  const rows = (milestones as MilestoneWithRelations[]).map((m) => ({
    id: m.id,
    title: m.title,
    status: m.status,
    dueDate: m.dueDate,
    phase: m.phase,
    dossier: m.dossier
      ? {
          id: m.dossier.id,
          reference: m.dossier.reference,
          title: m.dossier.title,
          phase: m.dossier.phase,
        }
      : { id: "", reference: "", title: "", phase: "" },
  }));

  return (
    <PageContainer>
      <SectionHeader
        title="Jalons"
        description="Tous les jalons par dossier"
        action={
          <ButtonLink href="/milestones/new" variant="primary" size="md">
            <Plus className="h-4 w-4" />
            Nouveau jalon
          </ButtonLink>
        }
      />
      <div className="mt-6">
        <Suspense fallback={<MilestonesTableFallback />}>
          <MilestonesTable milestones={rows} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
