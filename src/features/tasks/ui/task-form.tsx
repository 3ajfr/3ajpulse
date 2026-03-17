"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { taskSchema, type TaskInput } from "@/features/tasks/validation/task-schemas";
import { taskStatuses } from "@/lib/domain/enums";

const statusLabels: Record<string, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  BLOCKED: "Bloqué",
  DONE: "Terminé",
  CANCELLED: "Annulé",
};

interface TaskFormDefaultValues {
  dossierId?: string;
  title?: string;
  description?: string;
  status?: TaskInput["status"];
  dueDate?: string | Date;
  priority?: number;
  assignedToUserId?: string;
}

interface TaskFormProps {
  dossiers: { id: string; reference: string; title: string }[];
  members: { id: string; name: string }[];
  defaultValues?: TaskFormDefaultValues;
  taskId?: string;
  onSubmit: (data: TaskInput) => Promise<unknown>;
}

function toISODate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function TaskForm({
  dossiers,
  members,
  defaultValues,
  taskId,
  onSubmit,
}: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  type TaskFormValues = Omit<TaskInput, "dueDate"> & { dueDate?: string };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as Resolver<TaskFormValues>,
    defaultValues: {
      dossierId: "",
      title: "",
      description: "",
      status: "TODO",
      priority: 2,
      assignedToUserId: "",
      ...defaultValues,
      dueDate:
        typeof defaultValues?.dueDate === "string"
          ? defaultValues.dueDate
          : defaultValues?.dueDate
            ? toISODate(defaultValues.dueDate as unknown as Date)
            : undefined,
    },
  });

  async function handleFormSubmit(data: TaskFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {submitError && (
        <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 px-4 py-3 text-sm text-[var(--error)]">
          {submitError}
        </div>
      )}

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Tâche
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Dossier"
            name="dossierId"
            error={errors.dossierId?.message}
            required
          >
            <FormSelect {...register("dossierId")} id="dossierId">
              <option value="">Sélectionner un dossier</option>
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.reference} — {d.title}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            label="Statut"
            name="status"
            error={errors.status?.message}
          >
            <FormSelect {...register("status")} id="status">
              {taskStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s] ?? s}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            label="Titre"
            name="title"
            error={errors.title?.message}
            required
            className="sm:col-span-2"
          >
            <FormInput
              {...register("title")}
              id="title"
              placeholder="Intitulé de la tâche"
            />
          </FormField>
          <FormField
            label="Description"
            name="description"
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <FormTextarea
              {...register("description")}
              id="description"
              placeholder="Description…"
              rows={3}
            />
          </FormField>
          <FormField
            label="Échéance"
            name="dueDate"
            error={errors.dueDate?.message}
          >
            <FormInput
              {...register("dueDate")}
              id="dueDate"
              type="date"
            />
          </FormField>
          <FormField
            label="Assigné à"
            name="assignedToUserId"
            error={errors.assignedToUserId?.message}
          >
            <FormSelect {...register("assignedToUserId")} id="assignedToUserId">
              <option value="">Non assigné</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : taskId ? "Enregistrer" : "Créer"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
