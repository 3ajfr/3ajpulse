import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { FolderOpen, Receipt } from "lucide-react";
import {
  getPaymentCreationContextAction,
  registerPaymentAction,
} from "@/features/invoices/server/actions";
import { PaymentForm } from "@/features/invoices/ui/payment-form";

function normalizeQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const dossierId = normalizeQueryValue(resolvedSearchParams.dossierId);
  const invoiceId = normalizeQueryValue(resolvedSearchParams.invoiceId);
  const context = await getPaymentCreationContextAction({ dossierId, invoiceId });

  return (
    <PageContainer>
      <SectionHeader
        title="Nouveau règlement"
        description="Encaissement et imputation sur une ou plusieurs factures"
      />

      {!context.selectedDossierId ? (
        <div className="mt-8 space-y-6">
          {context.dossiers.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-6 w-6" />}
              title="Aucun dossier disponible"
              description="Créez d'abord un dossier et des factures pour enregistrer un règlement."
            />
          ) : (
            <>
              <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                  Sélection du dossier
                </h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Sélectionnez un dossier pour voir les factures encore ouvertes et enregistrer le
                  règlement.
                </p>
              </section>
              <div className="grid gap-4 lg:grid-cols-2">
                {context.dossiers.map((dossier) => (
                  <Link
                    key={dossier.id}
                    href={`/payments/new?dossierId=${dossier.id}`}
                    className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--surface)]/40"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                      {dossier.reference}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-[var(--text)]">
                      {dossier.title}
                    </h3>
                  </Link>
                ))}
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
                  Encaissement
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">
                  Imputation sur factures ouvertes
                </h2>
              </div>
              <ButtonLink href="/payments" variant="secondary">
                <Receipt className="h-4 w-4" />
                Retour paiements
              </ButtonLink>
            </div>
          </section>

          <PaymentForm
            dossierId={context.selectedDossierId ?? undefined}
            openInvoices={context.openInvoices.map((invoice) => ({
              id: invoice.id,
              invoiceNo: invoice.invoiceNo,
              label: invoice.label,
              dueDate: invoice.dueDate,
              totalAmount: Number(invoice.totalAmount) || 0,
              remainingDue: invoice.remainingDue,
            }))}
            selectedInvoiceId={context.selectedInvoice?.id}
            suggestedAmount={context.suggestedAmount}
            onSubmit={registerPaymentAction}
            successHref={context.selectedInvoice ? `/invoices/${context.selectedInvoice.id}` : "/payments"}
          />
        </div>
      )}
    </PageContainer>
  );
}
