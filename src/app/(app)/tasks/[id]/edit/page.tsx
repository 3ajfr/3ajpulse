import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { TaskForm } from "@/features/tasks/ui/task-form";
import {
  getTaskAction,
  updateTaskAction,
  listWorkspaceMembersAction,
} from "@/features/tasks/server/actions";
import { listDossiersForSelectAction } from "@/features/dossiers/server/actions";
function toISODate(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, dossiers, members] = await Promise.all([
    getTaskAction(id),
    listDossiersForSelectAction(),
    listWorkspaceMembersAction(),
  ]);

  if (!task) notFound();

  const dossierOptions = dossiers.map((d) => ({
    id: d.id,
    reference: d.reference,
    title: d.title,
  }));

  const defaultValues = {
    dossierId: task.dossierId,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    dueDate: toISODate(task.dueDate),
    priority: task.priority,
    assignedToUserId: task.assignedToUserId ?? "",
  };

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/tasks" className="hover:text-[var(--text)]">
          Tâches
        </Link>
        <span>/</span>
        <Link href={`/tasks/${id}/edit`} className="hover:text-[var(--text)]">
          {task.title}
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Modifier</span>
      </div>
      <SectionHeader
        title="Modifier la tâche"
        description={task.title}
      />
      <div className="mt-8">
        <TaskForm
          dossiers={dossierOptions}
          members={members}
          defaultValues={defaultValues}
          taskId={id}
          onSubmit={async (data) => {
            const result = await updateTaskAction(id, data);
            if (!result) throw new Error("Erreur lors de la mise à jour");
            return result;
          }}
        />
      </div>
    </PageContainer>
  );
}
