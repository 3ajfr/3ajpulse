"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import {
  invoiceSchema,
  type InvoiceInput,
} from "@/features/invoices/validation/invoice-schemas";
import {
  invoiceStatusLabels,
  invoiceTypeLabels,
  missionTypeLabels,
  toNumber,
} from "@/features/invoices/lib/finance";
import { calculateInvoiceTotals } from "@/lib/business/calculations";
import { invoiceTypes } from "@/lib/domain/enums";
import { formatCurrency, formatHoursFromMinutes } from "@/lib/format";

type InvoiceFormValues = Omit<
  InvoiceInput,
  "issueDate" | "dueDate" | "sentAt" | "paidAt" | "subtotalAmount" | "vatAmount" | "totalAmount"
> & {
  issueDate?: string;
  dueDate?: string;
  sentAt?: string;
  paidAt?: string;
};

const invoiceFormSchema = invoiceSchema
  .omit({
    invoiceNo: true,
    issueDate: true,
    sentAt: true,
    dueDate: true,
    paidAt: true,
    subtotalAmount: true,
    vatAmount: true,
    totalAmount: true,
  })
  .extend({
    issueDate: z.string().min(1, "La date d'émission est requise"),
    dueDate: z.string().min(1, "La date d'échéance est requise"),
    sentAt: z.string().optional(),
    paidAt: z.string().optional(),
  });

interface InvoiceFormProps {
  dossier: {
    id: string;
    reference: string;
    title: string;
    client: {
      name: string;
      legalName: string | null;
      billingAddress: string | null;
    } | null;
    missions: Array<{
      id: string;
      type: InvoiceInput["lines"][number]["missionType"];
      feeAmount: number;
      estimatedHours: number;
      hourlyRate: number;
      trackedMinutes: number;
      trackedValue: number;
      alreadyInvoiced: number;
      remainingFee: number;
    }>;
    totalFeeAmount: number;
    totalTrackedValue: number;
  };
  nextInvoiceNo: string;
  defaultVatRate: number;
  defaultDueDate: Date;
  presetType?: InvoiceInput["type"];
  onSubmit: (data: InvoiceInput) => Promise<{ id: string }>;
}

function toISODate(value: Date | string | null | undefined) {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

const workflowStatuses = ["DRAFT", "ISSUED", "SENT", "PENDING"] as const;

export function InvoiceForm({
  dossier,
  nextInvoiceNo,
  defaultVatRate,
  defaultDueDate,
  presetType,
  onSubmit,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      dossierId: dossier.id,
      type: presetType ?? "MISSION",
      status: "DRAFT",
      currency: "EUR",
      label: `${invoiceTypeLabels[presetType ?? "MISSION"]} ${dossier.reference}`,
      notes: "",
      issueDate: toISODate(new Date()),
      dueDate: toISODate(defaultDueDate),
      lines: [
        {
          label: "Honoraires",
          quantity: 1,
          unitPrice: 0,
          vatRate: defaultVatRate,
          sortOrder: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const watchedLines = watch("lines");
  const lines = useMemo(() => watchedLines ?? [], [watchedLines]);
  const currentType = watch("type");
  const totals = useMemo(() => calculateInvoiceTotals(lines), [lines]);
  const allocatedMissionTotal = useMemo(
    () =>
      lines.reduce((total, line) => {
        if (!line.missionType) return total;
        return total + toNumber(line.quantity) * toNumber(line.unitPrice);
      }, 0),
    [lines]
  );

  function appendMissionLine(input: {
    missionType: NonNullable<InvoiceInput["lines"][number]["missionType"]>;
    label: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }) {
    append({
      missionType: input.missionType,
      label: input.label,
      description: input.description,
      quantity: roundCurrency(input.quantity),
      unitPrice: roundCurrency(input.unitPrice),
      vatRate: defaultVatRate,
      sortOrder: fields.length,
    });
  }

  async function handleFormSubmit(values: InvoiceFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: InvoiceInput = {
        dossierId: values.dossierId,
        invoiceNo: nextInvoiceNo,
        type: values.type,
        status: values.status,
        issueDate: values.issueDate ? new Date(values.issueDate) : undefined,
        sentAt: values.sentAt ? new Date(values.sentAt) : undefined,
        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        paidAt: undefined,
        currency: values.currency,
        label: values.label,
        notes: values.notes,
        subtotalAmount: roundCurrency(totals.subtotal),
        vatAmount: roundCurrency(totals.vat),
        totalAmount: roundCurrency(totals.total),
        lines: values.lines.map((line, index) => ({
          missionType: line.missionType,
          label: line.label,
          description: line.description,
          quantity: toNumber(line.quantity),
          unitPrice: toNumber(line.unitPrice),
          vatRate: toNumber(line.vatRate),
          sortOrder: index,
        })),
      };

      const invoice = await onSubmit(payload);

      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {submitError ? (
        <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 px-4 py-3 text-sm text-[var(--error)]">
          {submitError}
        </div>
      ) : null}

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Dossier
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
              {dossier.reference} · {dossier.title}
            </h2>
            {dossier.client ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {dossier.client.legalName || dossier.client.name}
              </p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
                Numéro
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">{nextInvoiceNo}</p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
                Honoraires
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {formatCurrency(dossier.totalFeeAmount)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
                Temps valorisé
              </p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {formatCurrency(dossier.totalTrackedValue)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Paramètres de facturation
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Type" name="type" error={errors.type?.message} required>
            <FormSelect
              {...register("type", {
                onChange: (event) => {
                  const nextType = event.target.value as InvoiceInput["type"];
                  setValue("label", `${invoiceTypeLabels[nextType]} ${dossier.reference}`);
                },
              })}
              id="type"
            >
              {invoiceTypes.map((type) => (
                <option key={type} value={type}>
                  {invoiceTypeLabels[type]}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Statut" name="status" error={errors.status?.message}>
            <FormSelect {...register("status")} id="status">
              {workflowStatuses.map((status) => (
                <option key={status} value={status}>
                  {invoiceStatusLabels[status]}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField
            label="Date d'émission"
            name="issueDate"
            error={errors.issueDate?.message}
            required
          >
            <FormInput {...register("issueDate")} id="issueDate" type="date" />
          </FormField>
          <FormField
            label="Échéance"
            name="dueDate"
            error={errors.dueDate?.message}
            required
          >
            <FormInput {...register("dueDate")} id="dueDate" type="date" />
          </FormField>
          <FormField
            label="Libellé"
            name="label"
            error={errors.label?.message}
            required
            className="sm:col-span-2 lg:col-span-3"
          >
            <FormInput {...register("label")} id="label" placeholder="Objet de la facture" />
          </FormField>
          <FormField label="Devise" name="currency" error={errors.currency?.message}>
            <FormInput {...register("currency")} id="currency" maxLength={3} />
          </FormField>
          <FormField
            label="Notes"
            name="notes"
            error={errors.notes?.message}
            className="sm:col-span-2 lg:col-span-4"
          >
            <FormTextarea
              {...register("notes")}
              id="notes"
              rows={4}
              placeholder="Conditions de règlement, mentions complémentaires…"
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Lignes de facture
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Type actuel : {invoiceTypeLabels[currentType]}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({
                label: "Nouvelle ligne",
                quantity: 1,
                unitPrice: 0,
                vatRate: defaultVatRate,
                sortOrder: fields.length,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Ajouter une ligne
          </Button>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-3">
          {dossier.missions.map((mission) => {
            const trackedHours = mission.trackedMinutes / 60;
            const hourlyRateFromTime =
              trackedHours > 0 ? mission.trackedValue / trackedHours : mission.hourlyRate;

            return (
              <div
                key={mission.id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      {missionTypeLabels[mission.type ?? "LCA"]}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Forfait {formatCurrency(mission.feeAmount)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--text-faint)]">
                    <p>Déjà facturé {formatCurrency(mission.alreadyInvoiced)}</p>
                    <p>Restant {formatCurrency(mission.remainingFee)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                  <p>
                    Temps suivi : {formatHoursFromMinutes(mission.trackedMinutes)} ·{" "}
                    {formatCurrency(mission.trackedValue)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      appendMissionLine({
                        missionType: mission.type ?? "LCA",
                        label: `${missionTypeLabels[mission.type ?? "LCA"]} - honoraires`,
                        quantity: 1,
                        unitPrice: mission.feeAmount,
                      })
                    }
                  >
                    Mission
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={mission.remainingFee <= 0}
                    onClick={() =>
                      appendMissionLine({
                        missionType: mission.type ?? "LCA",
                        label: `${missionTypeLabels[mission.type ?? "LCA"]} - acompte 30 %`,
                        quantity: 1,
                        unitPrice: mission.remainingFee * 0.3,
                      })
                    }
                  >
                    Acompte 30 %
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={mission.remainingFee <= 0}
                    onClick={() =>
                      appendMissionLine({
                        missionType: mission.type ?? "LCA",
                        label: `${missionTypeLabels[mission.type ?? "LCA"]} - solde`,
                        quantity: 1,
                        unitPrice: mission.remainingFee,
                      })
                    }
                  >
                    Solde
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={trackedHours <= 0}
                    onClick={() =>
                      appendMissionLine({
                        missionType: mission.type ?? "LCA",
                        label: `${missionTypeLabels[mission.type ?? "LCA"]} - temps passé`,
                        quantity: roundCurrency(trackedHours),
                        unitPrice: roundCurrency(hourlyRateFromTime),
                        description: `${formatHoursFromMinutes(mission.trackedMinutes)} valorisées`,
                      })
                    }
                  >
                    Temps
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]/40 p-4"
            >
              <div className="grid gap-4 lg:grid-cols-12">
                <FormField
                  label="Mission"
                  name={`lines.${index}.missionType`}
                  error={errors.lines?.[index]?.missionType?.message}
                  className="lg:col-span-2"
                >
                  <FormSelect {...register(`lines.${index}.missionType`)} id={`line-${index}-mission`}>
                    <option value="">Libre</option>
                    {dossier.missions.map((mission) => (
                      <option key={mission.id} value={mission.type ?? undefined}>
                        {missionTypeLabels[mission.type ?? "LCA"]}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>
                <FormField
                  label="Libellé"
                  name={`lines.${index}.label`}
                  error={errors.lines?.[index]?.label?.message}
                  className="lg:col-span-4"
                  required
                >
                  <FormInput {...register(`lines.${index}.label`)} id={`line-${index}-label`} />
                </FormField>
                <FormField
                  label="Quantité"
                  name={`lines.${index}.quantity`}
                  error={errors.lines?.[index]?.quantity?.message}
                  className="lg:col-span-2"
                  required
                >
                  <FormInput
                    {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                    id={`line-${index}-quantity`}
                    type="number"
                    min={0.01}
                    step={0.01}
                  />
                </FormField>
                <FormField
                  label="PU HT"
                  name={`lines.${index}.unitPrice`}
                  error={errors.lines?.[index]?.unitPrice?.message}
                  className="lg:col-span-2"
                  required
                >
                  <FormInput
                    {...register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                    id={`line-${index}-unitPrice`}
                    type="number"
                    min={0}
                    step={0.01}
                  />
                </FormField>
                <FormField
                  label="TVA"
                  name={`lines.${index}.vatRate`}
                  error={errors.lines?.[index]?.vatRate?.message}
                  className="lg:col-span-1"
                  required
                >
                  <FormInput
                    {...register(`lines.${index}.vatRate`, { valueAsNumber: true })}
                    id={`line-${index}-vatRate`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </FormField>
                <div className="flex items-end lg:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  label="Description"
                  name={`lines.${index}.description`}
                  error={errors.lines?.[index]?.description?.message}
                  className="lg:col-span-12"
                >
                  <FormTextarea
                    {...register(`lines.${index}.description`)}
                    id={`line-${index}-description`}
                    rows={2}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Sous-total HT</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatCurrency(totals.subtotal)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">TVA</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatCurrency(totals.vat)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Total TTC</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatCurrency(totals.total)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
              Montant missionné
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatCurrency(allocatedMissionTotal)}
            </p>
          </div>
        </div>
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
          {isSubmitting ? "Création…" : "Créer la facture"}
        </Button>
      </div>
    </form>
  );
}
