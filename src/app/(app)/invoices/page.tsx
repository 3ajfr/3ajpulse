import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import {
  TableWrapper,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table-wrapper";
import { FilePlus } from "lucide-react";
import { listInvoicesAction } from "@/features/invoices/server/actions";
import { InvoiceStatusBadge } from "@/features/invoices/ui/invoice-status-badge";
import { invoiceTypeLabels, toNumber } from "@/features/invoices/lib/finance";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoicesPage() {
  const invoices = await listInvoicesAction();

  return (
    <PageContainer>
      <SectionHeader
        title="Factures"
        description="Suivi des honoraires, situations et soldes"
        action={
          <ButtonLink href="/invoices/new" variant="primary" size="md">
            <FilePlus className="h-4 w-4" />
            Nouvelle facture
          </ButtonLink>
        }
      />
      <div className="mt-6">
        <TableWrapper>
          <TableHeader>
            <TableHeaderCell>N° Facture</TableHeaderCell>
            <TableHeaderCell>Dossier</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell align="right">Total TTC</TableHeaderCell>
            <TableHeaderCell align="right">Payé</TableHeaderCell>
            <TableHeaderCell align="right">Restant</TableHeaderCell>
            <TableHeaderCell>Statut</TableHeaderCell>
            <TableHeaderCell>Échéance</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
                >
                  Aucune facture
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {inv.invoiceNo}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          {inv.dossier?.reference ?? "—"}
                        </p>
                        <p className="text-xs text-[var(--text-faint)]">
                          {inv.label}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{invoiceTypeLabels[inv.type]}</TableCell>
                    <TableCell align="right" className="font-medium">
                      {formatCurrency(toNumber(inv.totalAmount))}
                    </TableCell>
                    <TableCell align="right" className="text-[var(--success)]">
                      {formatCurrency(inv.totalPaid)}
                    </TableCell>
                    <TableCell align="right" className="font-medium">
                      {formatCurrency(inv.remainingDue)}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={inv.resolvedStatus} dueDate={inv.dueDate} />
                    </TableCell>
                    <TableCell className="text-[var(--text-muted)]">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </TableWrapper>
      </div>
    </PageContainer>
  );
}
