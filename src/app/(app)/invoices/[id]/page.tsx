import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  FilePlus,
  Printer,
  Receipt,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InvoiceStatusBadge } from "@/features/invoices/ui/invoice-status-badge";
import {
  cancelInvoiceAction,
  deleteDraftInvoiceAction,
  getInvoiceAction,
  setInvoiceWorkflowStatusAction,
} from "@/features/invoices/server/actions";
import {
  invoiceTypeLabels,
  missionTypeLabels,
  paymentMethodLabels,
  toNumber,
} from "@/features/invoices/lib/finance";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceAction(id);

  if (!invoice) {
    notFound();
  }

  const canDeleteDraft = invoice.status === "DRAFT" && invoice.totalPaid <= 0;
  const canCancel = invoice.resolvedStatus !== "CANCELLED" && invoice.totalPaid <= 0;
  const canRecordPayment =
    invoice.resolvedStatus !== "PAID" && invoice.resolvedStatus !== "CANCELLED";

  async function issueInvoice() {
    "use server";

    await setInvoiceWorkflowStatusAction(id, "ISSUED");
    redirect(`/invoices/${id}`);
  }

  async function sendInvoice() {
    "use server";

    await setInvoiceWorkflowStatusAction(id, "SENT");
    redirect(`/invoices/${id}`);
  }

  async function markPendingInvoice() {
    "use server";

    await setInvoiceWorkflowStatusAction(id, "PENDING");
    redirect(`/invoices/${id}`);
  }

  async function cancelInvoice() {
    "use server";

    await cancelInvoiceAction(id);
    redirect(`/invoices/${id}`);
  }

  async function deleteDraftInvoice() {
    "use server";

    await deleteDraftInvoiceAction(id);
    redirect("/invoices");
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Link href="/invoices" className="inline-flex items-center gap-2 hover:text-[var(--text)]">
            <ArrowLeft className="h-4 w-4" />
            Factures
          </Link>
          <span>/</span>
          <span className="text-[var(--text)]">{invoice.invoiceNo}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/invoices/${invoice.id}/pdf`} variant="secondary" size="sm">
            <Printer className="h-4 w-4" />
            PDF
          </ButtonLink>
          {canRecordPayment ? (
            <ButtonLink href={`/payments/new?invoiceId=${invoice.id}`} size="sm">
              <Banknote className="h-4 w-4" />
              Enregistrer un règlement
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <SectionHeader
        title={invoice.invoiceNo}
        description={`${invoiceTypeLabels[invoice.type]} · ${invoice.label}`}
        action={
          <div className="flex flex-wrap gap-3">
            {invoice.resolvedStatus === "DRAFT" ? (
              <form action={issueInvoice}>
                <Button type="submit" variant="secondary" size="sm">
                  <FilePlus className="h-4 w-4" />
                  Émettre
                </Button>
              </form>
            ) : null}
            {invoice.resolvedStatus === "ISSUED" ? (
              <form action={sendInvoice}>
                <Button type="submit" variant="secondary" size="sm">
                  <Send className="h-4 w-4" />
                  Marquer envoyée
                </Button>
              </form>
            ) : null}
            {(invoice.resolvedStatus === "ISSUED" || invoice.resolvedStatus === "SENT") &&
            invoice.totalPaid <= 0 ? (
              <form action={markPendingInvoice}>
                <Button type="submit" variant="secondary" size="sm">
                  <Receipt className="h-4 w-4" />
                  En attente
                </Button>
              </form>
            ) : null}
            {canCancel ? (
              <ConfirmForm
                message="Annuler cette facture ? Cette action est irréversible."
                action={cancelInvoice}
              >
                <Button type="submit" variant="ghost" size="sm">
                  <XCircle className="h-4 w-4" />
                  Annuler
                </Button>
              </ConfirmForm>
            ) : null}
            {canDeleteDraft ? (
              <ConfirmForm
                message="Supprimer définitivement ce brouillon ?"
                action={deleteDraftInvoice}
              >
                <Button type="submit" variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </ConfirmForm>
            ) : null}
          </div>
        }
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Statut"
          value={<InvoiceStatusBadge status={invoice.resolvedStatus} dueDate={invoice.dueDate} />}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          label="Sous-total HT"
          value={formatCurrency(toNumber(invoice.subtotalAmount))}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          label="TVA"
          value={formatCurrency(toNumber(invoice.vatAmount))}
          icon={<Receipt className="h-4 w-4" />}
        />
        <KpiCard
          label="Total payé"
          value={formatCurrency(invoice.totalPaid)}
          icon={<Banknote className="h-4 w-4" />}
        />
        <KpiCard
          label="Restant dû"
          value={formatCurrency(invoice.remainingDue)}
          trend={invoice.remainingDue > 0 ? "down" : "up"}
          icon={<Banknote className="h-4 w-4" />}
        />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Lignes de facturation
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {invoice.lines.map((line) => {
              const lineSubtotal = toNumber(line.quantity) * toNumber(line.unitPrice);

              return (
                <div key={line.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--text)]">{line.label}</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {line.description || "Sans description complémentaire"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-faint)]">
                        {line.missionFee ? (
                          <span>Mission {missionTypeLabels[line.missionFee.type]}</span>
                        ) : null}
                        <span>Qté {toNumber(line.quantity).toLocaleString("fr-FR")}</span>
                        <span>PU {formatCurrency(toNumber(line.unitPrice))}</span>
                        <span>TVA {toNumber(line.vatRate).toLocaleString("fr-FR")} %</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text)]">{formatCurrency(lineSubtotal)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[var(--border-subtle)] bg-[var(--surface)]/40 px-5 py-4">
            <div className="ml-auto grid max-w-sm gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Sous-total HT</span>
                <span className="font-medium text-[var(--text)]">
                  {formatCurrency(toNumber(invoice.subtotalAmount))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">TVA</span>
                <span className="font-medium text-[var(--text)]">
                  {formatCurrency(toNumber(invoice.vatAmount))}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
                <span className="font-medium text-[var(--text)]">Total TTC</span>
                <span className="text-base font-semibold text-[var(--text)]">
                  {formatCurrency(toNumber(invoice.totalAmount))}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Références
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-[var(--text-faint)]">Dossier</p>
                <Link
                  href={`/dossiers/${invoice.dossierId}/invoices`}
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  {invoice.dossier.reference} · {invoice.dossier.title}
                </Link>
              </div>
              <div>
                <p className="text-[var(--text-faint)]">Client</p>
                <p className="font-medium text-[var(--text)]">
                  {invoice.dossier.client?.legalName || invoice.dossier.client?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-faint)]">Dates</p>
                <p className="text-[var(--text)]">Émission : {formatDate(invoice.issueDate)}</p>
                <p className="text-[var(--text)]">Échéance : {formatDate(invoice.dueDate)}</p>
                <p className="text-[var(--text)]">Paiement : {formatDate(invoice.paidAt)}</p>
              </div>
              <div>
                <p className="text-[var(--text-faint)]">Créée par</p>
                <p className="text-[var(--text)]">{invoice.createdBy?.name ?? "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Règles de sécurité
            </h2>
            <div className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
              <p>Suppression autorisée uniquement pour un brouillon sans règlement.</p>
              <p>Annulation autorisée uniquement tant qu&apos;aucun règlement n&apos;est imputé.</p>
              <p>Les statuts partiellement payé et payé sont calculés à partir des règlements.</p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Historique des règlements
            </h2>
          </div>
          {invoice.paymentAllocations.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<Banknote className="h-6 w-6" />}
                title="Aucun règlement"
                description="Les paiements imputés à cette facture apparaîtront ici."
              />
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {invoice.paymentAllocations.map((allocation) => (
                <div key={allocation.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {paymentMethodLabels[allocation.payment.method]} ·{" "}
                        {formatCurrency(toNumber(allocation.amount))}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Reçu le {formatDate(allocation.payment.receivedAt)}
                        {allocation.payment.reference ? ` · ${allocation.payment.reference}` : ""}
                      </p>
                      {allocation.payment.payerName ? (
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {allocation.payment.payerName}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right text-sm text-[var(--text-muted)]">
                      <p>Règlement #{allocation.payment.id.slice(-6)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Activité finance
            </h2>
          </div>
          {invoice.activities.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<Receipt className="h-6 w-6" />}
                title="Aucune activité"
                description="L'historique de la facture sera affiché ici."
              />
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {invoice.activities.map((activity) => (
                <div key={activity.id} className="px-5 py-4">
                  <p className="text-sm text-[var(--text)]">{activity.description}</p>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
