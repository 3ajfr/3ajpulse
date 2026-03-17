import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageContainer>
      <SectionHeader
        title="Paramètres"
        description="Configuration du workspace et des préférences"
      />
      <div className="mt-8">
        <EmptyState
          icon={<Settings className="h-6 w-6" />}
          title="Paramètres à venir"
          description="La configuration du workspace, des utilisateurs et des préférences sera disponible après l'implémentation de l'authentification."
        />
      </div>
    </PageContainer>
  );
}
