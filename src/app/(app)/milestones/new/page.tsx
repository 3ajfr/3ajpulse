import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { MilestoneForm } from "@/features/milestones/ui/milestone-form";
import { listDossiersForSelectAction } from "@/features/dossiers/server/actions";
import { createMilestoneAction } from "@/features/milestones/server/actions";

export default async function NewMilestonePage() {
  const dossiers = await listDossiersForSelectAction();

  const dossierOptions = dossiers.map((d) => ({
    id: d.id,
    reference: d.reference,
    title: d.title,
  }));

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/milestones" className="hover:text-[var(--text)]">
          Jalons
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Nouveau jalon</span>
      </div>
      <SectionHeader
        title="Nouveau jalon"
        description="Créer un jalon et l'associer à un dossier"
      />
      <div className="mt-8">
        <MilestoneForm
          dossiers={dossierOptions}
          onSubmit={async (data) => {
            const result = await createMilestoneAction(data);
            if (!result) throw new Error("Erreur lors de la création");
            return result;
          }}
        />
      </div>
    </PageContainer>
  );
}
