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
import {
  milestoneSchema,
  type MilestoneInput,
} from "@/features/milestones/validation/milestone-schemas";
import { milestoneStatuses, businessPhases } from "@/lib/domain/enums";

const statusLabels: Record<string, string> = {
  PLANNED: "Prévu",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
  CANCELLED: "Annulé",
};

const phaseLabels: Record<string, string> = {
  PROSPECTION: "Prospection",
  CLOSING: "Closing",
  LCA: "LCA",
  LCMP: "LCMP",
  LCSC: "LCSC",
  CHANTIER: "Chantier",
  RECEPTION: "Réception",
};

interface MilestoneFormDefaultValues {
  dossierId?: string;
  title?: string;
  description?: string;
  status?: MilestoneInput["status"];
  dueDate?: string | Date;
  phase?: MilestoneInput["phase"] | string;
  sortOrder?: number;
}

interface MilestoneFormProps {
  dossiers: { id: string; reference: string; title: string }[];
  defaultValues?: MilestoneFormDefaultValues;
  milestoneId?: string;
  onSubmit: (data: MilestoneInput) => Promise<unknown>;
}

function toISODate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function MilestoneForm({
  dossiers,
  defaultValues,
  milestoneId,
  onSubmit,
}: MilestoneFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  type MilestoneFormValues = Omit<MilestoneInput, "dueDate" | "phase"> & {
    dueDate?: string;
    phase?: string;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema) as Resolver<MilestoneFormValues>,
    defaultValues: {
      dossierId: "",
      title: "",
      description: "",
      status: "PLANNED",
      phase: undefined,
      sortOrder: 0,
      ...defaultValues,
      dueDate:
        typeof defaultValues?.dueDate === "string"
          ? defaultValues.dueDate
          : defaultValues?.dueDate
            ? toISODate(defaultValues.dueDate as unknown as Date)
            : undefined,
    },
  });

  async function handleFormSubmit(data: MilestoneFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        phase: data.phase && data.phase !== "" ? (data.phase as MilestoneInput["phase"]) : undefined,
      });
      router.push("/milestones");
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
          Jalon
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
              {milestoneStatuses.map((s) => (
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
              placeholder="Intitulé du jalon"
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
            <FormInput {...register("dueDate")} id="dueDate" type="date" />
          </FormField>
          <FormField
            label="Phase"
            name="phase"
            error={errors.phase?.message}
          >
            <FormSelect {...register("phase")} id="phase">
              <option value="">Aucune</option>
              {businessPhases.map((p) => (
                <option key={p} value={p}>
                  {phaseLabels[p] ?? p}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            label="Ordre"
            name="sortOrder"
            error={errors.sortOrder?.message}
          >
            <FormInput
              {...register("sortOrder", { valueAsNumber: true })}
              id="sortOrder"
              type="number"
              min={0}
            />
          </FormField>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : milestoneId ? "Enregistrer" : "Créer"}
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
