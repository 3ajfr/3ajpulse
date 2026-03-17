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
  paymentSchema,
  type PaymentInput,
} from "@/features/invoices/validation/invoice-schemas";
import { paymentMethodLabels, toNumber } from "@/features/invoices/lib/finance";
import { paymentMethods } from "@/lib/domain/enums";
import { formatCurrency, formatDate } from "@/lib/format";

type PaymentFormValues = Omit<PaymentInput, "receivedAt"> & {
  receivedAt: string;
};

const paymentFormSchema = paymentSchema.extend({
  receivedAt: z.string().min(1, "La date de règlement est requise"),
});

interface PaymentFormProps {
  dossierId?: string;
  openInvoices: Array<{
    id: string;
    invoiceNo: string;
    label: string;
    dueDate: Date | string | null;
    totalAmount: number;
    remainingDue: number;
  }>;
  selectedInvoiceId?: string;
  suggestedAmount?: number;
  onSubmit: (data: PaymentInput) => Promise<unknown>;
  successHref: string;
}

function toISODate(value: Date | string | null | undefined) {
  if (!value) return "";

  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function PaymentForm({
  dossierId,
  openInvoices,
  selectedInvoiceId,
  suggestedAmount,
  onSubmit,
  successHref,
}: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedInvoice =
    openInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null;

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      dossierId,
      receivedAt: toISODate(new Date()),
      amount: roundCurrency(suggestedAmount ?? selectedInvoice?.remainingDue ?? 0),
      method: "TRANSFER",
      reference: "",
      payerName: "",
      notes: "",
      allocations: selectedInvoice
        ? [
            {
              invoiceId: selectedInvoice.id,
              amount: roundCurrency(selectedInvoice.remainingDue),
            },
          ]
        : openInvoices[0]
          ? [
              {
                invoiceId: openInvoices[0].id,
                amount: roundCurrency(openInvoices[0].remainingDue),
              },
            ]
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allocations",
  });

  const amount = toNumber(watch("amount"));
  const watchedAllocations = watch("allocations");
  const allocations = useMemo(() => watchedAllocations ?? [], [watchedAllocations]);
  const totalAllocated = useMemo(
    () =>
      allocations.reduce((total, allocation) => total + toNumber(allocation.amount), 0),
    [allocations]
  );
  const remainingToAllocate = roundCurrency(amount - totalAllocated);

  async function handleFormSubmit(values: PaymentFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit({
        dossierId: values.dossierId || undefined,
        receivedAt: new Date(values.receivedAt),
        amount: roundCurrency(toNumber(values.amount)),
        method: values.method,
        reference: values.reference,
        payerName: values.payerName,
        notes: values.notes,
        allocations: values.allocations.map((allocation) => ({
          invoiceId: allocation.invoiceId,
          amount: roundCurrency(toNumber(allocation.amount)),
        })),
      });

      router.push(successHref);
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
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Encaissement
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            label="Date de règlement"
            name="receivedAt"
            error={errors.receivedAt?.message}
            required
          >
            <FormInput {...register("receivedAt")} id="receivedAt" type="date" />
          </FormField>
          <FormField label="Montant reçu" name="amount" error={errors.amount?.message} required>
            <FormInput
              {...register("amount", { valueAsNumber: true })}
              id="amount"
              type="number"
              min={0.01}
              step={0.01}
            />
          </FormField>
          <FormField label="Mode" name="method" error={errors.method?.message}>
            <FormSelect {...register("method")} id="method">
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Référence" name="reference" error={errors.reference?.message}>
            <FormInput {...register("reference")} id="reference" />
          </FormField>
          <FormField
            label="Payeur"
            name="payerName"
            error={errors.payerName?.message}
            className="sm:col-span-2"
          >
            <FormInput {...register("payerName")} id="payerName" />
          </FormField>
          <FormField
            label="Notes"
            name="notes"
            error={errors.notes?.message}
            className="sm:col-span-2"
          >
            <FormTextarea {...register("notes")} id="notes" rows={3} />
          </FormField>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Imputation
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Répartissez le règlement sur les factures ouvertes du dossier.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({
                invoiceId: openInvoices[0]?.id ?? "",
                amount: 0,
              })
            }
            disabled={openInvoices.length === 0}
          >
            <Plus className="h-4 w-4" />
            Ajouter une imputation
          </Button>
        </div>

        {openInvoices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            Aucune facture ouverte pour ce contexte.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]/40 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-12">
                  <FormField
                    label="Facture"
                    name={`allocations.${index}.invoiceId`}
                    error={errors.allocations?.[index]?.invoiceId?.message}
                    className="lg:col-span-8"
                    required
                  >
                    <FormSelect
                      {...register(`allocations.${index}.invoiceId`)}
                      id={`allocation-${index}-invoice`}
                    >
                      <option value="">Sélectionner une facture</option>
                      {openInvoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNo} · {invoice.label} · solde{" "}
                          {formatCurrency(invoice.remainingDue)}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                  <FormField
                    label="Montant imputé"
                    name={`allocations.${index}.amount`}
                    error={errors.allocations?.[index]?.amount?.message}
                    className="lg:col-span-3"
                    required
                  >
                    <FormInput
                      {...register(`allocations.${index}.amount`, { valueAsNumber: true })}
                      id={`allocation-${index}-amount`}
                      type="number"
                      min={0.01}
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
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Montant reçu</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatCurrency(amount)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
              Total imputé
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">
              {formatCurrency(totalAllocated)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
              Reste à affecter
            </p>
            <p
              className={`mt-1 text-lg font-semibold ${
                remainingToAllocate < 0 ? "text-[var(--error)]" : "text-[var(--text)]"
              }`}
            >
              {formatCurrency(remainingToAllocate)}
            </p>
          </div>
        </div>
      </section>

      {selectedInvoice ? (
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Facture ciblée
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Facture</p>
              <p className="mt-1 font-semibold text-[var(--text)]">{selectedInvoice.invoiceNo}</p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Échéance</p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {formatDate(selectedInvoice.dueDate)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Total TTC</p>
              <p className="mt-1 font-semibold text-[var(--text)]">
                {formatCurrency(selectedInvoice.totalAmount)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Solde</p>
              <p className="mt-1 font-semibold text-[var(--warning)]">
                {formatCurrency(selectedInvoice.remainingDue)}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || openInvoices.length === 0}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer le règlement"}
        </Button>
      </div>
    </form>
  );
}
