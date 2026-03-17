import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, FilePlus, Receipt } from "lucide-react";
import { DossierNav } from "@/components/layout/dossier-nav";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InvoiceStatusBadge } from "@/features/invoices/ui/invoice-status-badge";
import {
  listInvoicesAction,
  listPaymentsAction,
} from "@/features/invoices/server/actions";
import { getDossierAction } from "@/features/dossiers/server/actions";
import { invoiceTypeLabels, missionTypeLabels, toNumber } from "@/features/invoices/lib/finance";
import { formatCurrency, formatDate, formatHoursFromMinutes } from "@/lib/format";

export default async function DossierFinancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dossier, invoices, payments] = await Promise.all([
    getDossierAction(id),
    listInvoicesAction(id),
    listPaymentsAction(id),
  ]);

  if (!dossier) {
    notFound();
  }

  return (
    <>
      <DossierNav dossierId={id} dossierRef={dossier.reference} />
      <PageContainer>
        <SectionHeader
          title="Finance dossier"
          description={`${dossier.reference} · Honoraires, factures et règlements`}
          action={
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/invoices/new?dossierId=${id}`}>
                <FilePlus className="h-4 w-4" />
                Nouvelle facture
              </ButtonLink>
              <ButtonLink href={`/payments/new?dossierId=${id}`} variant="secondary">
                <Banknote className="h-4 w-4" />
                Nouveau règlement
              </ButtonLink>
            </div>
          }
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Honoraires prévus
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">
              {formatCurrency(dossier.totalFeeAmount ?? 0)}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Facturé
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">
              {formatCurrency(dossier.totalInvoiced ?? 0)}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Encaissé
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
              {formatCurrency(dossier.totalPaid ?? 0)}
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Restant dû
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">
              {formatCurrency(dossier.remainingDue ?? 0)}
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
            Missions et honoraires
          </h2>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {dossier.missions.length === 0 ? (
              <div className="xl:col-span-3">
                <EmptyState
                  icon={<Receipt className="h-6 w-6" />}
                  title="Aucune mission"
                  description="Les honoraires par mission apparaîtront ici."
                />
              </div>
            ) : (
              dossier.missions.map((mission) => {
                const trackedMinutes = dossier.timeEntries
                  .filter((entry) => entry.missionFeeId === mission.id)
                  .reduce((total, entry) => total + entry.minutes, 0);

                return (
                  <div
                    key={mission.id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)]/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-[var(--text)]">
                        {missionTypeLabels[mission.type]}
                      </p>
                      <ButtonLink
                        href={`/invoices/new?dossierId=${id}&type=MISSION`}
                        variant="ghost"
                        size="sm"
                      >
                        Facturer
                      </ButtonLink>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
                      <p>Forfait : {formatCurrency(toNumber(mission.feeAmount))}</p>
                      <p>Heures estimées : {formatHoursFromMinutes(toNumber(mission.estimatedHours) * 60)}</p>
                      <p>Temps suivi : {formatHoursFromMinutes(trackedMinutes)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
                Factures du dossier
              </h2>
            </div>
            {invoices.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={<Receipt className="h-6 w-6" />}
                  title="Aucune facture"
                  description="Lancez une première facture pour ce dossier."
                />
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="block px-5 py-4 transition-colors hover:bg-[var(--surface)]/40"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--text)]">
                          {invoice.invoiceNo} · {invoice.label}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {invoiceTypeLabels[invoice.type]} · échéance {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-semibold text-[var(--text)]">
                            {formatCurrency(toNumber(invoice.totalAmount))}
                          </p>
                          <p className="text-[var(--text-faint)]">
                            Solde {formatCurrency(invoice.remainingDue)}
                          </p>
                        </div>
                        <InvoiceStatusBadge status={invoice.resolvedStatus} dueDate={invoice.dueDate} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
                Historique des règlements
              </h2>
            </div>
            {payments.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={<Banknote className="h-6 w-6" />}
                  title="Aucun règlement"
                  description="Les encaissements du dossier apparaîtront ici."
                />
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {payments.map((payment) => (
                  <div key={payment.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          {formatCurrency(toNumber(payment.amount))} · {formatDate(payment.receivedAt)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {payment.payerName || "Payeur non renseigné"}
                        </p>
                        {payment.allocations.length > 0 ? (
                          <p className="mt-1 text-xs text-[var(--text-faint)]">
                            {payment.allocations
                              .map((allocation) => allocation.invoice.invoiceNo)
                              .join(", ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-[var(--success)]">
                          Imputé {formatCurrency(payment.allocatedAmount)}
                        </p>
                        <p className="text-[var(--warning)]">
                          À affecter {formatCurrency(payment.unallocatedAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </>
  );
}
