import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { MilestoneForm } from "@/features/milestones/ui/milestone-form";
import {
  getMilestoneAction,
  updateMilestoneAction,
} from "@/features/milestones/server/actions";
import { listDossiersForSelectAction } from "@/features/dossiers/server/actions";

function toISODate(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default async function EditMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [milestone, dossiers] = await Promise.all([
    getMilestoneAction(id),
    listDossiersForSelectAction(),
  ]);

  if (!milestone) notFound();

  const dossierOptions = dossiers.map((d) => ({
    id: d.id,
    reference: d.reference,
    title: d.title,
  }));

  const defaultValues = {
    dossierId: milestone.dossierId,
    title: milestone.title,
    description: milestone.description ?? "",
    status: milestone.status,
    dueDate: toISODate(milestone.dueDate),
    phase: milestone.phase ?? "",
    sortOrder: milestone.sortOrder,
  };

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/milestones" className="hover:text-[var(--text)]">
          Jalons
        </Link>
        <span>/</span>
        <Link href={`/milestones/${id}/edit`} className="hover:text-[var(--text)]">
          {milestone.title}
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Modifier</span>
      </div>
      <SectionHeader
        title="Modifier le jalon"
        description={milestone.title}
      />
      <div className="mt-8">
        <MilestoneForm
          dossiers={dossierOptions}
          defaultValues={defaultValues}
          milestoneId={id}
          onSubmit={async (data) => {
            const result = await updateMilestoneAction(id, data);
            if (!result) throw new Error("Erreur lors de la mise à jour");
            return result;
          }}
        />
      </div>
    </PageContainer>
  );
}
