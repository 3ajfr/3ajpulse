import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { DossierForm } from "@/features/dossiers/ui/dossier-form";
import { listClientsAction } from "@/features/clients/server/actions";
import { createDossierAction } from "@/features/dossiers/server/actions";

export default async function NewDossierPage() {
  const clients = await listClientsAction();
  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name }));

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/dossiers" className="hover:text-[var(--text)]">
          Dossiers
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Nouveau dossier</span>
      </div>
      <SectionHeader
        title="Nouveau dossier"
        description="Créer un nouveau dossier de maîtrise d'œuvre"
      />
      <div className="mt-8">
        <DossierForm
          clients={clientOptions}
          onSubmit={async (data) => {
            const result = await createDossierAction(data);
            if (!result) throw new Error("Erreur lors de la création");
            return result;
          }}
        />
      </div>
    </PageContainer>
  );
}
