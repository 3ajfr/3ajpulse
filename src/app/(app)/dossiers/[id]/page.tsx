import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { DossierNav } from "@/components/layout/dossier-nav";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  FileCheck,
  Briefcase,
  ListTodo,
  Euro,
  Flag,
  Activity,
  Pencil,
  FolderOpen,
  Receipt,
} from "lucide-react";
import { getDossierAction } from "@/features/dossiers/server/actions";
import { InvoiceStatusBadge } from "@/features/invoices/ui/invoice-status-badge";
import { paymentMethodLabels } from "@/features/invoices/lib/finance";
import {
  formatCurrency,
  formatDate,
  formatHoursFromMinutes,
} from "@/lib/format";

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  DORMANT: "Dormant",
  ARCHIVED: "Archivé",
  CANCELLED: "Annulé",
};

const phaseLabels: Record<string, string> = {
  PROSPECTION: "Prospection",
  CLOSING: "Closing",
  LCA: "LCA",
  LCMP: "LCMP",
  LCSC: "LCSC",
  CHANTIER: "Chantier",
  RECEPTION: "Réception",
};

const missionLabels: Record<string, string> = {
  LCA: "LCA",
  LCMP: "LCMP",
  LCSC: "LCSC",
};

const milestoneStatusLabels: Record<string, string> = {
  PLANNED: "Prévu",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
  CANCELLED: "Annulé",
};

const taskStatusLabels: Record<string, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  BLOCKED: "Bloqué",
  DONE: "Terminé",
  CANCELLED: "Annulé",
};

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  if (v && typeof v === "object" && "toString" in v)
    return Number((v as { toString(): string }).toString()) || 0;
  return 0;
}

function InfoCard({
  title,
  icon: Icon,
  children,
  emptyMessage = "Aucune information",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
        <Icon className="h-4 w-4 text-[var(--text-faint)]" />
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
          {title}
        </h2>
      </div>
      <div className="p-5">
        {children ?? (
          <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dossier = await getDossierAction(id);

  if (!dossier) notFound();

  const totalFeeAmount = dossier.totalFeeAmount ?? 0;
  const totalInvoiced = dossier.totalInvoiced ?? 0;
  const totalPaid = dossier.totalPaid ?? 0;
  const remainingDue = dossier.remainingDue ?? 0;
  const totalTrackedMinutes = dossier.totalTrackedTimeMinutes ?? 0;
  const tasksTodo = dossier.tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length;
  const tasksDone = dossier.tasks.filter((t) => t.status === "DONE").length;
  const milestonesUpcoming = dossier.milestones.filter(
    (m) => m.status !== "DONE" && m.status !== "CANCELLED"
  ).length;

  return (
    <>
      <DossierNav dossierId={id} dossierRef={dossier.reference} />
      <PageContainer>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href="/dossiers" className="hover:text-[var(--text)]">
              Dossiers
            </Link>
            <span>/</span>
            <span className="text-[var(--text)]">{dossier.reference}</span>
          </div>
          <ButtonLink
            href={`/dossiers/${id}/edit`}
            variant="outline"
            size="sm"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </ButtonLink>
        </div>

        {/* Premium summary header */}
        <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-6 py-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                {dossier.reference}
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text)]">
                {dossier.title}
              </h1>
              {dossier.description && (
                <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-muted)]">
                  {dossier.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  dossier.status === "ACTIVE"
                    ? "success"
                    : dossier.status === "CANCELLED"
                      ? "error"
                      : "neutral"
                }
              >
                {statusLabels[dossier.status] ?? dossier.status}
              </Badge>
              <Badge variant="outline">
                {phaseLabels[dossier.phase] ?? dossier.phase}
              </Badge>
              {dossier.progress != null && (
                <Badge variant="info">{dossier.progress}% avancement</Badge>
              )}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Tâches"
            value={`${tasksTodo} à faire`}
            subtext={`${tasksDone} terminées`}
            icon={<ListTodo className="h-4 w-4" />}
          />
          <KpiCard
            label="Jalons à venir"
            value={milestonesUpcoming}
            subtext={
              dossier.nextMilestone
                ? `${dossier.nextMilestone.title} — ${formatDate(dossier.nextMilestone.dueDate)}`
                : undefined
            }
            icon={<Flag className="h-4 w-4" />}
          />
          <KpiCard
            label="Honoraires"
            value={formatCurrency(totalFeeAmount)}
            subtext={`Facturé : ${formatCurrency(totalInvoiced)}`}
            icon={<Euro className="h-4 w-4" />}
          />
          <KpiCard
            label="Temps enregistré"
            value={formatHoursFromMinutes(totalTrackedMinutes)}
            subtext={`${dossier.timeEntries.length} entrées`}
            icon={<Activity className="h-4 w-4" />}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Client */}
          <InfoCard title="Client" icon={Building2}>
            {dossier.client ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-[var(--text)]">
                  {dossier.client.name}
                </p>
                {dossier.client.legalName && (
                  <p className="text-[var(--text-muted)]">
                    {dossier.client.legalName}
                  </p>
                )}
                {dossier.client.email && (
                  <p>
                    <a
                      href={`mailto:${dossier.client.email}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {dossier.client.email}
                    </a>
                  </p>
                )}
                {dossier.client.phone && (
                  <p className="text-[var(--text-muted)]">{dossier.client.phone}</p>
                )}
                {dossier.client.billingAddress && (
                  <p className="text-[var(--text-muted)]">
                    {dossier.client.billingAddress}
                  </p>
                )}
                {dossier.contacts?.length ? (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                      Contacts
                    </p>
                    {dossier.contacts.map((dc) => (
                      <p key={dc.id} className="mt-1">
                        {dc.contact.firstName} {dc.contact.lastName}
                        {dc.roleLabel && ` — ${dc.roleLabel}`}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Aucun client</p>
            )}
          </InfoCard>

          {/* Chantier */}
          <InfoCard title="Chantier" icon={MapPin}>
            {dossier.chantierInfo ? (
              <div className="space-y-2 text-sm">
                {dossier.chantierInfo.siteName && (
                  <p className="font-medium text-[var(--text)]">
                    {dossier.chantierInfo.siteName}
                  </p>
                )}
                {(dossier.chantierInfo.addressLine1 ||
                  dossier.chantierInfo.city) && (
                  <p className="text-[var(--text-muted)]">
                    {[
                      dossier.chantierInfo.addressLine1,
                      dossier.chantierInfo.addressLine2,
                      [
                        dossier.chantierInfo.postalCode,
                        dossier.chantierInfo.city,
                      ]
                        .filter(Boolean)
                        .join(" "),
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {dossier.chantierInfo.accessNotes && (
                  <p className="text-[var(--text-muted)]">
                    Accès : {dossier.chantierInfo.accessNotes}
                  </p>
                )}
                {dossier.chantierInfo.safetyNotes && (
                  <p className="text-[var(--text-muted)]">
                    Sécurité : {dossier.chantierInfo.safetyNotes}
                  </p>
                )}
                {(dossier.chantierInfo.expectedStartDate ||
                  dossier.chantierInfo.expectedEndDate) && (
                  <p className="text-[var(--text-faint)]">
                    {dossier.chantierInfo.expectedStartDate &&
                      `Début prévu : ${formatDate(dossier.chantierInfo.expectedStartDate)}`}
                    {dossier.chantierInfo.expectedStartDate &&
                      dossier.chantierInfo.expectedEndDate &&
                      " · "}
                    {dossier.chantierInfo.expectedEndDate &&
                      `Fin prévue : ${formatDate(dossier.chantierInfo.expectedEndDate)}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                Aucune information chantier
              </p>
            )}
          </InfoCard>

          {/* Admin */}
          <InfoCard title="Administratif" icon={FileCheck}>
            {dossier.adminInfo ? (
              <div className="space-y-2 text-sm">
                {dossier.adminInfo.permitReference && (
                  <p>
                    <span className="text-[var(--text-faint)]">Permis : </span>
                    {dossier.adminInfo.permitReference}
                  </p>
                )}
                {dossier.adminInfo.permitFiledAt && (
                  <p className="text-[var(--text-muted)]">
                    Dépôt : {formatDate(dossier.adminInfo.permitFiledAt)}
                  </p>
                )}
                {dossier.adminInfo.permitGrantedAt && (
                  <p className="text-[var(--text-muted)]">
                    Délivré : {formatDate(dossier.adminInfo.permitGrantedAt)}
                  </p>
                )}
                {dossier.adminInfo.insurancePolicy && (
                  <p>
                    <span className="text-[var(--text-faint)]">Assurance : </span>
                    {dossier.adminInfo.insurancePolicy}
                  </p>
                )}
                {(dossier.adminInfo.projectBudgetAmount != null ||
                  dossier.adminInfo.estimatedWorksAmount != null) && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    {dossier.adminInfo.projectBudgetAmount != null && (
                      <p>
                        Budget projet :{" "}
                        {formatCurrency(toNum(dossier.adminInfo.projectBudgetAmount))}
                      </p>
                    )}
                    {dossier.adminInfo.estimatedWorksAmount != null && (
                      <p>
                        Montant travaux :{" "}
                        {formatCurrency(toNum(dossier.adminInfo.estimatedWorksAmount))}
                      </p>
                    )}
                  </div>
                )}
                {dossier.adminInfo.notes && (
                  <p className="mt-2 text-[var(--text-muted)]">
                    {dossier.adminInfo.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                Aucune information administrative
              </p>
            )}
          </InfoCard>

          {/* Missions LCA/LCMP/LCSC */}
          <InfoCard title="Missions (LCA / LCMP / LCSC)" icon={Briefcase}>
            {dossier.missions?.length ? (
              <div className="space-y-3">
                {dossier.missions.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {missionLabels[m.type] ?? m.type}
                      </p>
                      {m.estimatedHours != null && (
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatHoursFromMinutes(
                            toNum(m.estimatedHours) * 60
                          )}{" "}
                          estimées
                          {m.hourlyRate != null &&
                            ` · ${formatCurrency(toNum(m.hourlyRate))}/h`}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-[var(--text)]">
                      {m.feeAmount != null
                        ? formatCurrency(toNum(m.feeAmount))
                        : "—"}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between border-t border-[var(--border-subtle)] pt-3 font-medium">
                  <span>Total honoraires</span>
                  <span>{formatCurrency(totalFeeAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                Aucune mission définie
              </p>
            )}
          </InfoCard>
        </div>

        {/* Milestone timeline */}
        <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
            <Flag className="h-4 w-4 text-[var(--text-faint)]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Jalons
            </h2>
          </div>
          <div className="p-5">
            {dossier.milestones.length === 0 ? (
              <EmptyState
                icon={<Flag className="h-6 w-6" />}
                title="Aucun jalon"
                description="Les jalons du projet apparaîtront ici"
              />
            ) : (
              <div className="space-y-2">
                {dossier.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {m.title}
                      </p>
                      {m.description && (
                        <p className="text-sm text-[var(--text-muted)]">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-sm text-[var(--text-muted)]">
                        {formatDate(m.dueDate)}
                      </span>
                      <Badge
                        variant={
                          m.status === "DONE"
                            ? "success"
                            : m.status === "IN_PROGRESS"
                              ? "info"
                              : "neutral"
                        }
                      >
                        {milestoneStatusLabels[m.status] ?? m.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Tasks */}
        <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
            <ListTodo className="h-4 w-4 text-[var(--text-faint)]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Tâches
            </h2>
          </div>
          <div className="p-5">
            {dossier.tasks.length === 0 ? (
              <EmptyState
                icon={<ListTodo className="h-6 w-6" />}
                title="Aucune tâche"
                description="Les tâches du dossier apparaîtront ici"
              />
            ) : (
              <div className="space-y-2">
                {dossier.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="line-clamp-1 text-sm text-[var(--text-muted)]">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-sm text-[var(--text-muted)]">
                        {formatDate(t.dueDate)}
                      </span>
                      <Badge
                        variant={
                          t.status === "DONE"
                            ? "success"
                            : t.status === "BLOCKED"
                              ? "error"
                              : t.status === "IN_PROGRESS"
                                ? "info"
                                : "neutral"
                        }
                      >
                        {taskStatusLabels[t.status] ?? t.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Finance summary */}
        <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
            <Euro className="h-4 w-4 text-[var(--text-faint)]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Finance
            </h2>
          </div>
          <div className="p-5">
            <div className="mb-6 flex flex-wrap gap-3">
              <ButtonLink href={`/dossiers/${id}/invoices`} variant="secondary" size="sm">
                <Receipt className="h-4 w-4" />
                Ouvrir l&apos;espace finance
              </ButtonLink>
              <ButtonLink href={`/invoices/new?dossierId=${id}`} size="sm">
                <Euro className="h-4 w-4" />
                Créer une facture
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Honoraires prévus
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {formatCurrency(totalFeeAmount)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Facturé
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                  {formatCurrency(totalInvoiced)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Encaissé
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--success)]">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Restant dû
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${remainingDue > 0 ? "text-[var(--warning)]" : "text-[var(--text)]"}`}
                >
                  {formatCurrency(remainingDue)}
                </p>
              </div>
            </div>
            {dossier.invoices?.length ? (
              <div className="mt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Factures ({dossier.invoices.length})
                </p>
                <div className="space-y-2">
                  {dossier.invoices.slice(0, 5).map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-4 py-2"
                    >
                      <div>
                        <span className="font-medium">{inv.invoiceNo}</span>
                        <p className="text-sm text-[var(--text-muted)]">
                          {formatCurrency(toNum(inv.totalAmount))}
                        </p>
                      </div>
                      <InvoiceStatusBadge
                        status={inv.status}
                        dueDate={inv.dueDate}
                      />
                    </Link>
                  ))}
                  {dossier.invoices.length > 5 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      +{dossier.invoices.length - 5} autres factures
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<FolderOpen className="h-6 w-6" />}
                title="Aucune facture"
                description="Les factures du dossier apparaîtront ici"
                className="mt-6"
              />
            )}
            {dossier.payments?.length ? (
              <div className="mt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Derniers règlements
                </p>
                <div className="space-y-2">
                  {dossier.payments.slice(0, 3).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-4 py-2"
                    >
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          {formatCurrency(toNum(payment.amount))}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {paymentMethodLabels[payment.method]} · {formatDate(payment.receivedAt)}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-faint)]">
                        {payment.allocations.length
                          ? payment.allocations
                              .map((allocation) => allocation.invoice.invoiceNo)
                              .join(", ")
                          : "Non imputé"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Activity feed */}
        <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
            <Activity className="h-4 w-4 text-[var(--text-faint)]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Activité
            </h2>
          </div>
          <div className="p-5">
            {dossier.activities?.length === 0 ? (
              <EmptyState
                icon={<Activity className="h-6 w-6" />}
                title="Aucune activité"
                description="L'historique des actions apparaîtra ici"
              />
            ) : (
              <div className="space-y-3">
                {dossier.activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 rounded-lg border border-[var(--border-subtle)] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--text)]">
                        {a.description}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-faint)]">
                        {formatDate(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
