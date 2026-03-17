import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUserSession } from "@/lib/auth/session";
import { getInvoiceById } from "@/features/invoices/server/invoice-repository";
import { invoiceTypeLabels, toNumber } from "@/features/invoices/lib/finance";
import { PrintButton } from "@/features/invoices/ui/print-button";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoicePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUserSession();
  const { id } = await params;
  const invoice = await getInvoiceById(session.user.workspaceId, id);

  if (!invoice) {
    notFound();
  }

  const client = invoice.dossier.client;

  return (
    <main className="min-h-screen bg-[#f5f1ea] px-4 py-8 text-[#1f1f1f] print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between gap-4 print:hidden">
        <Link href={`/invoices/${invoice.id}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
          <ArrowLeft className="h-4 w-4" />
          Retour facture
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] print:rounded-none print:border-0 print:shadow-none">
        <div className="bg-[#171717] px-10 py-10 text-white">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">3AJPULSE</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Facture</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                Document premium prêt à l&apos;impression PDF, aligné sur les dossiers, les missions et les
                règlements saisis dans l&apos;application.
              </p>
            </div>
            <div className="grid min-w-[280px] gap-4 rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Numéro</p>
                <p className="mt-1 text-2xl font-semibold">{invoice.invoiceNo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/50">Type</p>
                  <p className="mt-1 font-medium">{invoiceTypeLabels[invoice.type]}</p>
                </div>
                <div>
                  <p className="text-white/50">Statut</p>
                  <p className="mt-1 font-medium">{invoice.resolvedStatus}</p>
                </div>
                <div>
                  <p className="text-white/50">Émise le</p>
                  <p className="mt-1 font-medium">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-white/50">Échéance</p>
                  <p className="mt-1 font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f8779]">
              Émetteur
            </p>
            <div className="mt-4 space-y-1 text-sm leading-6 text-[#3a3a3a]">
              <p className="text-lg font-semibold text-[#171717]">3AJPULSE</p>
              <p>Atelier de maîtrise d&apos;oeuvre</p>
              <p>Référence dossier : {invoice.dossier.reference}</p>
              <p>{invoice.dossier.title}</p>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f8779]">
              Facturé à
            </p>
            <div className="mt-4 space-y-1 text-sm leading-6 text-[#3a3a3a]">
              <p className="text-lg font-semibold text-[#171717]">
                {client?.legalName || client?.name || "Client"}
              </p>
              {client?.billingAddress ? <p className="whitespace-pre-line">{client.billingAddress}</p> : null}
              {client?.vatNumber ? <p>TVA : {client.vatNumber}</p> : null}
              {client?.siren ? <p>SIREN : {client.siren}</p> : null}
            </div>
          </section>
        </div>

        <div className="px-10 pb-10">
          <div className="overflow-hidden rounded-[24px] border border-black/6">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f6f3ee] text-[#756f63]">
                <tr>
                  <th className="px-6 py-4 font-medium">Libellé</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 text-right font-medium">Qté</th>
                  <th className="px-6 py-4 text-right font-medium">PU HT</th>
                  <th className="px-6 py-4 text-right font-medium">Montant HT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="border-t border-black/6">
                    <td className="px-6 py-4 align-top font-medium text-[#171717]">{line.label}</td>
                    <td className="px-6 py-4 align-top text-[#5a5a5a]">
                      {line.description || invoice.label}
                    </td>
                    <td className="px-6 py-4 text-right align-top text-[#171717]">
                      {toNumber(line.quantity).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right align-top text-[#171717]">
                      {formatCurrency(toNumber(line.unitPrice))}
                    </td>
                    <td className="px-6 py-4 text-right align-top font-semibold text-[#171717]">
                      {formatCurrency(toNumber(line.quantity) * toNumber(line.unitPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-[24px] bg-[#f6f3ee] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8f8779]">
                Conditions
              </p>
              <div className="mt-4 space-y-2 text-sm leading-6 text-[#4a4a4a]">
                <p>{invoice.notes || "Règlement à réception selon échéance indiquée sur la facture."}</p>
                <p>Document généré depuis 3AJPULSE, version imprimable optimisée pour export PDF.</p>
              </div>
            </section>

            <section className="rounded-[24px] border border-black/6 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-[#5f5f5f]">
                  <span>Sous-total HT</span>
                  <span>{formatCurrency(toNumber(invoice.subtotalAmount))}</span>
                </div>
                <div className="flex items-center justify-between text-[#5f5f5f]">
                  <span>TVA</span>
                  <span>{formatCurrency(toNumber(invoice.vatAmount))}</span>
                </div>
                <div className="flex items-center justify-between text-[#5f5f5f]">
                  <span>Total payé</span>
                  <span>{formatCurrency(invoice.totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-black/6 pt-4 text-base font-semibold text-[#171717]">
                  <span>Total TTC</span>
                  <span>{formatCurrency(toNumber(invoice.totalAmount))}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium text-[#8b6e31]">
                  <span>Restant dû</span>
                  <span>{formatCurrency(invoice.remainingDue)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
