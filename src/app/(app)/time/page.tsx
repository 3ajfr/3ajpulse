import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Clock } from "lucide-react";

export default function TimePage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Temps"
        description="Suivi du temps par compétence et par dossier"
      />
      <div className="mt-8">
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="Suivi du temps à venir"
          description="Le suivi des heures par compétence et par dossier sera disponible dans une phase ultérieure."
        />
      </div>
    </PageContainer>
  );
}
