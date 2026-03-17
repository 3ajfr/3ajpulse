import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { FolderOpen, Receipt } from "lucide-react";
import {
  createInvoiceAction,
  getInvoiceCreationContextAction,
} from "@/features/invoices/server/actions";
import { invoiceTypeLabels } from "@/features/invoices/lib/finance";
import { InvoiceForm } from "@/features/invoices/ui/invoice-form";
import type { InvoiceType } from "@/lib/domain/enums";

function normalizeQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const dossierId = normalizeQueryValue(resolvedSearchParams.dossierId);
  const presetType = normalizeQueryValue(resolvedSearchParams.type) as InvoiceType | undefined;
  const context = await getInvoiceCreationContextAction(dossierId);

  return (
    <PageContainer>
      <SectionHeader
        title="Nouvelle facture"
        description="Création d'une facture à partir d'un dossier existant"
      />

      {!context.selectedDossier ? (
        <div className="mt-8 space-y-6">
          {context.dossiers.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-6 w-6" />}
              title="Aucun dossier disponible"
              description="Créez d'abord un dossier pour pouvoir lancer la facturation."
            />
          ) : (
            <>
              <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                  Sélection du dossier
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Choisissez le dossier à facturer pour préparer la numérotation, les missions et les
                  suggestions de lignes.
                </p>
              </section>
              <div className="grid gap-4 lg:grid-cols-2">
                {context.dossiers.map((dossier) => {
                  const href = presetType
                    ? `/invoices/new?dossierId=${dossier.id}&type=${presetType}`
                    : `/invoices/new?dossierId=${dossier.id}`;

                  return (
                    <Link
                      key={dossier.id}
                      href={href}
                      className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--surface)]/40"
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                        {dossier.reference}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[var(--text)]">
                        {dossier.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Facturation
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {presetType ? invoiceTypeLabels[presetType] : "Facture dossier"}
                </h2>
              </div>
              <div className="flex gap-3">
                <ButtonLink href={`/dossiers/${context.selectedDossier.id}/invoices`} variant="secondary">
                  <Receipt className="h-4 w-4" />
                  Retour dossier
                </ButtonLink>
              </div>
            </div>
          </section>

          <InvoiceForm
            dossier={context.selectedDossier}
            nextInvoiceNo={context.nextInvoiceNo}
            defaultVatRate={context.defaultVatRate}
            defaultDueDate={context.defaultDueDate}
            presetType={presetType}
            onSubmit={createInvoiceAction}
          />
        </div>
      )}
    </PageContainer>
  );
}
