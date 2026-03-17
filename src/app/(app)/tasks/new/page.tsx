import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { TaskForm } from "@/features/tasks/ui/task-form";
import { listDossiersForSelectAction } from "@/features/dossiers/server/actions";
import {
  createTaskAction,
  listWorkspaceMembersAction,
} from "@/features/tasks/server/actions";

export default async function NewTaskPage() {
  const [dossiers, members] = await Promise.all([
    listDossiersForSelectAction(),
    listWorkspaceMembersAction(),
  ]);

  const dossierOptions = dossiers.map((d) => ({
    id: d.id,
    reference: d.reference,
    title: d.title,
  }));

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/tasks" className="hover:text-[var(--text)]">
          Tâches
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Nouvelle tâche</span>
      </div>
      <SectionHeader
        title="Nouvelle tâche"
        description="Créer une tâche et l'associer à un dossier"
      />
      <div className="mt-8">
        <TaskForm
          dossiers={dossierOptions}
          members={members}
          onSubmit={async (data) => {
            const result = await createTaskAction(data);
            if (!result) throw new Error("Erreur lors de la création");
            return result;
          }}
        />
      </div>
    </PageContainer>
  );
}
