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
import { EmptyState } from "@/components/ui/empty-state";
import { Banknote, Receipt } from "lucide-react";
import { listPaymentsAction } from "@/features/invoices/server/actions";
import { paymentMethodLabels, toNumber } from "@/features/invoices/lib/finance";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function PaymentsPage() {
  const payments = await listPaymentsAction();
  const totalCollected = payments.reduce((total, payment) => total + toNumber(payment.amount), 0);
  const totalUnallocated = payments.reduce(
    (total, payment) => total + payment.unallocatedAmount,
    0
  );

  return (
    <PageContainer>
      <SectionHeader
        title="Paiements"
        description="Encaissements, imputation et suivi des règlements"
        action={
          <ButtonLink href="/payments/new">
            <Banknote className="h-4 w-4" />
            Nouveau règlement
          </ButtonLink>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
            Encaissements
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">
            {formatCurrency(totalCollected)}
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
            Reste à affecter
          </p>
          <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">
            {formatCurrency(totalUnallocated)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {payments.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-6 w-6" />}
            title="Aucun règlement"
            description="Les encaissements enregistrés apparaîtront ici."
          />
        ) : (
          <TableWrapper>
            <TableHeader>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Dossier</TableHeaderCell>
              <TableHeaderCell>Payer</TableHeaderCell>
              <TableHeaderCell>Mode</TableHeaderCell>
              <TableHeaderCell align="right">Montant</TableHeaderCell>
              <TableHeaderCell align="right">Imputé</TableHeaderCell>
              <TableHeaderCell align="right">À affecter</TableHeaderCell>
              <TableHeaderCell>Référence</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.receivedAt)}</TableCell>
                  <TableCell>
                    {payment.dossier ? (
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          {payment.dossier.reference}
                        </p>
                        <p className="text-xs text-[var(--text-faint)]">{payment.dossier.title}</p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{payment.payerName || "—"}</TableCell>
                  <TableCell>{paymentMethodLabels[payment.method]}</TableCell>
                  <TableCell align="right" className="font-medium">
                    {formatCurrency(toNumber(payment.amount))}
                  </TableCell>
                  <TableCell align="right" className="text-[var(--success)]">
                    {formatCurrency(payment.allocatedAmount)}
                  </TableCell>
                  <TableCell align="right" className="text-[var(--warning)]">
                    {formatCurrency(payment.unallocatedAmount)}
                  </TableCell>
                  <TableCell>{payment.reference || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableWrapper>
        )}
      </div>
    </PageContainer>
  );
}
