"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { dossierSchema, type DossierInput } from "@/features/dossiers/validation/dossier-schemas";
import { businessPhases, dossierStatuses, missionTypes } from "@/lib/domain/enums";

const phaseLabels: Record<string, string> = {
  PROSPECTION: "Prospection",
  CLOSING: "Closing",
  LCA: "LCA",
  LCMP: "LCMP",
  LCSC: "LCSC",
  CHANTIER: "Chantier",
  RECEPTION: "Réception",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  DORMANT: "Dormant",
  ARCHIVED: "Archivé",
  CANCELLED: "Annulé",
};

interface DossierFormProps {
  clients: { id: string; name: string }[];
  defaultValues?: Partial<DossierInput>;
  dossierId?: string;
  onSubmit: (data: DossierInput) => Promise<unknown>;
}

export function DossierForm({
  clients,
  defaultValues,
  dossierId,
  onSubmit,
}: DossierFormProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    residence: false,
    chantier: false,
    admin: false,
    missions: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DossierInput>({
    resolver: zodResolver(dossierSchema) as Resolver<DossierInput>,
    defaultValues: {
      clientId: "",
      reference: "",
      title: "",
      description: "",
      status: "ACTIVE",
      phase: "PROSPECTION",
      priority: 2,
      country: "France",
      contacts: [],
      missions: missionTypes.map((type) => ({ type, feeAmount: undefined })),
      ...defaultValues,
    },
  });

  function toggleSection(key: string) {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }));
  }

  async function handleFormSubmit(data: DossierInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const missionsToSubmit = (data.missions ?? [])
        .filter((m) => {
          const amt = m.feeAmount;
          return typeof amt === "number" && !Number.isNaN(amt) && amt > 0;
        })
        .map((m) => ({
          type: m.type,
          feeAmount: m.feeAmount as number,
          estimatedHours:
            typeof m.estimatedHours === "number" && !Number.isNaN(m.estimatedHours)
              ? m.estimatedHours
              : undefined,
          hourlyRate:
            typeof m.hourlyRate === "number" && !Number.isNaN(m.hourlyRate)
              ? m.hourlyRate
              : undefined,
        }));
      const payload: DossierInput = {
        ...data,
        residenceInfo: data.residenceInfo &&
          (data.residenceInfo.operationName ||
            data.residenceInfo.typology ||
            data.residenceInfo.lotCount != null ||
            data.residenceInfo.surfaceSquareMeters != null)
          ? data.residenceInfo
          : undefined,
        chantierInfo: data.chantierInfo &&
          (data.chantierInfo.siteName ||
            data.chantierInfo.addressLine1 ||
            data.chantierInfo.city)
          ? data.chantierInfo
          : undefined,
        adminInfo: data.adminInfo &&
          (data.adminInfo.permitReference ||
            data.adminInfo.projectBudgetAmount != null)
          ? data.adminInfo
          : undefined,
        missions: missionsToSubmit,
      };
      await onSubmit(payload);
      router.push(dossierId ? `/dossiers/${dossierId}` : "/dossiers");
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
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-8"
    >
      {submitError && (
        <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 px-4 py-3 text-sm text-[var(--error)]">
          {submitError}
        </div>
      )}

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Identité du dossier
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Client / Maître d'ouvrage"
            name="clientId"
            error={errors.clientId?.message}
            required
          >
            <FormSelect {...register("clientId")} id="clientId">
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            label="Référence"
            name="reference"
            error={errors.reference?.message}
            required
          >
            <FormInput
              {...register("reference")}
              id="reference"
              placeholder="ex. DOS-2026-001"
            />
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
              placeholder="Intitulé du projet"
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
              placeholder="Description du projet…"
              rows={3}
            />
          </FormField>
          <FormField
            label="Statut"
            name="status"
            error={errors.status?.message}
          >
            <FormSelect {...register("status")} id="status">
              {dossierStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s] ?? s}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            label="Phase"
            name="phase"
            error={errors.phase?.message}
            required
          >
            <FormSelect {...register("phase")} id="phase">
              {businessPhases.map((p) => (
                <option key={p} value={p}>
                  {phaseLabels[p] ?? p}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Localisation
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Adresse"
            name="addressLine1"
            error={errors.addressLine1?.message}
          >
            <FormInput
              {...register("addressLine1")}
              id="addressLine1"
              placeholder="Numéro et rue"
            />
          </FormField>
          <FormField
            label="Complément"
            name="addressLine2"
            error={errors.addressLine2?.message}
          >
            <FormInput
              {...register("addressLine2")}
              id="addressLine2"
              placeholder="Bâtiment, étage…"
            />
          </FormField>
          <FormField
            label="Code postal"
            name="postalCode"
            error={errors.postalCode?.message}
          >
            <FormInput
              {...register("postalCode")}
              id="postalCode"
              placeholder="69001"
            />
          </FormField>
          <FormField
            label="Ville"
            name="city"
            error={errors.city?.message}
          >
            <FormInput
              {...register("city")}
              id="city"
              placeholder="Lyon"
            />
          </FormField>
          <FormField
            label="Libellé projet"
            name="projectLabel"
            error={errors.projectLabel?.message}
            className="sm:col-span-2"
          >
            <FormInput
              {...register("projectLabel")}
              id="projectLabel"
              placeholder="ex. Résidence Les Terrasses"
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Calendrier
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            label="Date de début"
            name="startDate"
            error={errors.startDate?.message}
          >
            <FormInput
              {...register("startDate")}
              id="startDate"
              type="date"
            />
          </FormField>
          <FormField
            label="Date de closing"
            name="closingDate"
            error={errors.closingDate?.message}
          >
            <FormInput
              {...register("closingDate")}
              id="closingDate"
              type="date"
            />
          </FormField>
          <FormField
            label="Début chantier"
            name="chantierStartDate"
            error={errors.chantierStartDate?.message}
          >
            <FormInput
              {...register("chantierStartDate")}
              id="chantierStartDate"
              type="date"
            />
          </FormField>
          <FormField
            label="Réception"
            name="receptionDate"
            error={errors.receptionDate?.message}
          >
            <FormInput
              {...register("receptionDate")}
              id="receptionDate"
              type="date"
            />
          </FormField>
        </div>
      </section>

      <OptionalSection
        title="Fiche résidence"
        expanded={expandedSections.residence}
        onToggle={() => toggleSection("residence")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Nom de l'opération"
            name="residenceInfo.operationName"
            error={errors.residenceInfo?.operationName?.message}
          >
            <FormInput
              {...register("residenceInfo.operationName")}
              id="residenceInfo.operationName"
            />
          </FormField>
          <FormField
            label="Typologie"
            name="residenceInfo.typology"
            error={errors.residenceInfo?.typology?.message}
          >
            <FormInput
              {...register("residenceInfo.typology")}
              id="residenceInfo.typology"
              placeholder="ex. Collectif neuf"
            />
          </FormField>
          <FormField
            label="Nombre de lots"
            name="residenceInfo.lotCount"
            error={errors.residenceInfo?.lotCount?.message}
          >
            <FormInput
              {...register("residenceInfo.lotCount", { valueAsNumber: true })}
              id="residenceInfo.lotCount"
              type="number"
              min={0}
            />
          </FormField>
          <FormField
            label="Surface (m²)"
            name="residenceInfo.surfaceSquareMeters"
            error={errors.residenceInfo?.surfaceSquareMeters?.message}
          >
            <FormInput
              {...register("residenceInfo.surfaceSquareMeters", {
                valueAsNumber: true,
              })}
              id="residenceInfo.surfaceSquareMeters"
              type="number"
              min={0}
              step={0.01}
            />
          </FormField>
          <FormField
            label="Nombre de niveaux"
            name="residenceInfo.levelsCount"
            error={errors.residenceInfo?.levelsCount?.message}
          >
            <FormInput
              {...register("residenceInfo.levelsCount", { valueAsNumber: true })}
              id="residenceInfo.levelsCount"
              type="number"
              min={0}
            />
          </FormField>
        </div>
      </OptionalSection>

      <OptionalSection
        title="Fiche chantier"
        expanded={expandedSections.chantier}
        onToggle={() => toggleSection("chantier")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Nom du site"
            name="chantierInfo.siteName"
            error={errors.chantierInfo?.siteName?.message}
          >
            <FormInput
              {...register("chantierInfo.siteName")}
              id="chantierInfo.siteName"
            />
          </FormField>
          <FormField
            label="Adresse chantier"
            name="chantierInfo.addressLine1"
            error={errors.chantierInfo?.addressLine1?.message}
          >
            <FormInput
              {...register("chantierInfo.addressLine1")}
              id="chantierInfo.addressLine1"
            />
          </FormField>
          <FormField
            label="Ville"
            name="chantierInfo.city"
            error={errors.chantierInfo?.city?.message}
          >
            <FormInput
              {...register("chantierInfo.city")}
              id="chantierInfo.city"
            />
          </FormField>
          <FormField
            label="Code postal"
            name="chantierInfo.postalCode"
            error={errors.chantierInfo?.postalCode?.message}
          >
            <FormInput
              {...register("chantierInfo.postalCode")}
              id="chantierInfo.postalCode"
            />
          </FormField>
          <FormField
            label="Date début prévue"
            name="chantierInfo.expectedStartDate"
            error={errors.chantierInfo?.expectedStartDate?.message}
            className="sm:col-span-2"
          >
            <FormInput
              {...register("chantierInfo.expectedStartDate")}
              id="chantierInfo.expectedStartDate"
              type="date"
            />
          </FormField>
          <FormField
            label="Date fin prévue"
            name="chantierInfo.expectedEndDate"
            error={errors.chantierInfo?.expectedEndDate?.message}
            className="sm:col-span-2"
          >
            <FormInput
              {...register("chantierInfo.expectedEndDate")}
              id="chantierInfo.expectedEndDate"
              type="date"
            />
          </FormField>
        </div>
      </OptionalSection>

      <OptionalSection
        title="Fiche admin"
        expanded={expandedSections.admin}
        onToggle={() => toggleSection("admin")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Référence permis"
            name="adminInfo.permitReference"
            error={errors.adminInfo?.permitReference?.message}
          >
            <FormInput
              {...register("adminInfo.permitReference")}
              id="adminInfo.permitReference"
            />
          </FormField>
          <FormField
            label="Budget projet (€)"
            name="adminInfo.projectBudgetAmount"
            error={errors.adminInfo?.projectBudgetAmount?.message}
          >
            <FormInput
              {...register("adminInfo.projectBudgetAmount", {
                valueAsNumber: true,
              })}
              id="adminInfo.projectBudgetAmount"
              type="number"
              min={0}
              step={0.01}
            />
          </FormField>
          <FormField
            label="Montant des travaux estimé (€)"
            name="adminInfo.estimatedWorksAmount"
            error={errors.adminInfo?.estimatedWorksAmount?.message}
          >
            <FormInput
              {...register("adminInfo.estimatedWorksAmount", {
                valueAsNumber: true,
              })}
              id="adminInfo.estimatedWorksAmount"
              type="number"
              min={0}
              step={0.01}
            />
          </FormField>
        </div>
      </OptionalSection>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Missions et honoraires
        </h3>
        <div className="space-y-5">
          {missionTypes.map((type, idx) => (
            <div
              key={type}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]/50 p-4"
            >
              <p className="mb-3 font-medium text-[var(--text)]">
                {phaseLabels[type] ?? type}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Honoraires (€)"
                  name={`missions.${idx}.feeAmount`}
                  error={errors.missions?.[idx]?.feeAmount?.message}
                >
                  <FormInput
                    {...register(`missions.${idx}.feeAmount`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </FormField>
                <FormField
                  label="Heures estimées"
                  name={`missions.${idx}.estimatedHours`}
                  error={errors.missions?.[idx]?.estimatedHours?.message}
                >
                  <FormInput
                    {...register(`missions.${idx}.estimatedHours`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="0"
                  />
                </FormField>
                <FormField
                  label="Taux horaire (€)"
                  name={`missions.${idx}.hourlyRate`}
                  error={errors.missions?.[idx]?.hourlyRate?.message}
                >
                  <FormInput
                    {...register(`missions.${idx}.hourlyRate`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <FormField
          label="Notes"
          name="notes"
          error={errors.notes?.message}
        >
          <FormTextarea
            {...register("notes")}
            id="notes"
            placeholder="Notes internes…"
            rows={4}
          />
        </FormField>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : dossierId ? "Enregistrer" : "Créer le dossier"}
        </Button>
      </div>
    </form>
  );
}

function OptionalSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[var(--surface)]/30"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          {title}
        </h3>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[var(--text-faint)]" />
        )}
      </button>
      {expanded && <div className="border-t border-[var(--border-subtle)] p-6">{children}</div>}
    </section>
  );
}
