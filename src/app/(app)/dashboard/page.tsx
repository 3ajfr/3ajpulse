import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  FolderOpen,
  Euro,
  Clock,
  FileText,
  AlertCircle,
  Flag,
  ListTodo,
} from "lucide-react";
import { getDashboardStatsAction } from "@/features/dashboard/server/actions";
import { formatCurrency, formatHoursFromMinutes, formatDate } from "@/lib/format";

const phaseLabels: Record<string, string> = {
  PROSPECTION: "Prospection",
  CLOSING: "Closing",
  LCA: "LCA",
  LCMP: "LCMP",
  LCSC: "LCSC",
  CHANTIER: "Chantier",
  RECEPTION: "Réception",
};

export default async function DashboardPage() {
  const stats = await getDashboardStatsAction();

  const subtextDossiers =
    stats.kpis.prospectionCount > 0 || stats.kpis.closingCount > 0
      ? `${stats.kpis.prospectionCount} en prospection, ${stats.kpis.closingCount} en closing`
      : undefined;

  return (
    <PageContainer>
      <SectionHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité et des indicateurs clés"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Dossiers actifs"
          value={stats.kpis.activeDossiers}
          subtext={subtextDossiers}
          icon={<FolderOpen className="h-4 w-4" />}
        />
        <KpiCard
          label="Heures ce mois"
          value={formatHoursFromMinutes(stats.kpis.totalMinutesThisMonth)}
          icon={<Clock className="h-4 w-4" />}
        />
        <KpiCard
          label="Encaissements"
          value={formatCurrency(stats.kpis.totalCollected)}
          subtext={`Restant à encaisser : ${formatCurrency(stats.kpis.totalRemaining)}`}
          icon={<Euro className="h-4 w-4" />}
        />
        <KpiCard
          label="Factures en attente"
          value={stats.kpis.invoicesAwaitingPayment}
          subtext={`${stats.kpis.overdueInvoices} en retard`}
          trend={
            stats.kpis.overdueInvoices > 0 ? "down" : undefined
          }
          icon={<FileText className="h-4 w-4" />}
        />
        <KpiCard
          label="Échéances à risque"
          value={stats.kpis.overdueInvoices}
          subtext="Factures en retard"
          trend={
            stats.kpis.overdueInvoices > 0 ? "down" : undefined
          }
          icon={<AlertCircle className="h-4 w-4" />}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Dossiers actifs
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {stats.activeDossiersList.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                Aucun dossier actif
              </div>
            ) : (
              stats.activeDossiersList.map((d) => (
                <Link
                  key={d.id}
                  href={`/dossiers/${d.id}`}
                  className="block px-5 py-3 transition-colors hover:bg-[var(--surface)]/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--text)]">
                        {d.reference}
                      </p>
                      <p className="truncate text-sm text-[var(--text-muted)]">
                        {d.title}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-faint)]">
                      {phaseLabels[d.phase] ?? d.phase}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-[var(--border-subtle)] px-5 py-2">
            <Link
              href="/dossiers"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Voir tous les dossiers →
            </Link>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Factures en attente
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {stats.invoicesAwaitingList.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                Aucune facture en attente
              </div>
            ) : (
              stats.invoicesAwaitingList.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="block px-5 py-3 transition-colors hover:bg-[var(--surface)]/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--text)]">
                        {inv.invoiceNo}
                      </p>
                      <p className="truncate text-sm text-[var(--text-muted)]">
                        {inv.dossierReference} · Échéance {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-[var(--text)]">
                      {formatCurrency(inv.remainingDue)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-[var(--border-subtle)] px-5 py-2">
            <Link
              href="/invoices"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Voir toutes les factures →
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Tâches urgentes
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {stats.urgentTasks.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-8 text-sm text-[var(--text-muted)]">
                <ListTodo className="h-4 w-4 shrink-0" />
                Aucune tâche urgente
              </div>
            ) : (
              stats.urgentTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/dossiers/${t.dossierId}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface)]/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text)]">
                      {t.title}
                    </p>
                    <p className="truncate text-sm text-[var(--text-muted)]">
                      {t.dossierReference} · {formatDate(t.dueDate)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--text-faint)]">
                    {t.status === "IN_PROGRESS" ? "En cours" : "À faire"}
                  </span>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-[var(--border-subtle)] px-5 py-2">
            <Link
              href="/dossiers"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Voir les dossiers →
            </Link>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Jalons à venir
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {stats.upcomingMilestones.length === 0 ? (
              <div className="flex items-center gap-3 px-5 py-8 text-sm text-[var(--text-muted)]">
                <Flag className="h-4 w-4 shrink-0" />
                Aucun jalon à venir
              </div>
            ) : (
              stats.upcomingMilestones.map((m) => (
                <Link
                  key={m.id}
                  href={`/dossiers/${m.dossierId}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface)]/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text)]">
                      {m.title}
                    </p>
                    <p className="truncate text-sm text-[var(--text-muted)]">
                      {m.dossierReference} · {formatDate(m.dueDate)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--text-faint)]">
                    {m.status === "IN_PROGRESS" ? "En cours" : "Prévu"}
                  </span>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-[var(--border-subtle)] px-5 py-2">
            <Link
              href="/dossiers"
              className="text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Voir les dossiers →
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
