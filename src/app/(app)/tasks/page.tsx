import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { TasksTable } from "@/features/tasks/ui/tasks-table";
import { listTasksAction } from "@/features/tasks/server/actions";
import { Plus } from "lucide-react";

function TasksTableFallback() {
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

export default async function TasksPage() {
  const tasks = await listTasksAction();

  type TaskWithRelations = (typeof tasks)[number] & {
    dossier?: { id: string; reference: string; title: string; phase: string };
    assignedTo?: { id: string; name: string } | null;
  };
  const rows = (tasks as TaskWithRelations[]).map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    dueDate: t.dueDate,
    dossier: t.dossier
      ? { id: t.dossier.id, reference: t.dossier.reference, title: t.dossier.title, phase: t.dossier.phase }
      : { id: "", reference: "", title: "", phase: "" },
    assignedTo: t.assignedTo ?? null,
  }));

  return (
    <PageContainer>
      <SectionHeader
        title="Tâches"
        description="Toutes les tâches par dossier"
        action={
          <ButtonLink href="/tasks/new" variant="primary" size="md">
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </ButtonLink>
        }
      />
      <div className="mt-6">
        <Suspense fallback={<TasksTableFallback />}>
          <TasksTable tasks={rows} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
