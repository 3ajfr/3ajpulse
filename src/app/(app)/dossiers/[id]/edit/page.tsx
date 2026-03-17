import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { DossierForm } from "@/features/dossiers/ui/dossier-form";
import { listClientsAction } from "@/features/clients/server/actions";
import { getDossierAction, updateDossierAction } from "@/features/dossiers/server/actions";
import type { DossierInput } from "@/features/dossiers/validation/dossier-schemas";
import type { MissionType } from "@/lib/domain/enums";

function toISODate(d: Date | string | null | undefined): string | undefined {
  if (!d) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function toNum(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

export default async function EditDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dossier, clients] = await Promise.all([
    getDossierAction(id),
    listClientsAction(),
  ]);

  if (!dossier) notFound();

  const missionByType = new Map(
    (dossier.missions ?? []).map((m) => [m.type, m])
  );
  const defaultMissions = (["LCA", "LCMP", "LCSC"] as MissionType[]).map((type) => {
    const existing = missionByType.get(type);
    return {
      type,
      feeAmount: toNum(existing?.feeAmount),
      estimatedHours: toNum(existing?.estimatedHours),
      hourlyRate: toNum(existing?.hourlyRate),
    };
  });

  const defaultValues: DossierInput = {
    clientId: dossier.clientId,
    reference: dossier.reference,
    title: dossier.title,
    description: dossier.description ?? "",
    status: dossier.status,
    phase: dossier.phase,
    priority: dossier.priority,
    city: dossier.city ?? "",
    postalCode: dossier.postalCode ?? "",
    country: dossier.country ?? "France",
    addressLine1: dossier.addressLine1 ?? "",
    addressLine2: dossier.addressLine2 ?? "",
    projectLabel: dossier.projectLabel ?? "",
    startDate: toISODate(dossier.startDate) as unknown as Date,
    closingDate: toISODate(dossier.closingDate) as unknown as Date,
    chantierStartDate: toISODate(dossier.chantierStartDate) as unknown as Date,
    receptionDate: toISODate(dossier.receptionDate) as unknown as Date,
    notes: dossier.notes ?? "",
    contacts: [],
    residenceInfo: dossier.residenceInfo
      ? {
          operationName: dossier.residenceInfo.operationName ?? undefined,
          typology: dossier.residenceInfo.typology ?? undefined,
          lotCount: toNum(dossier.residenceInfo.lotCount),
          surfaceSquareMeters: toNum(dossier.residenceInfo.surfaceSquareMeters),
          levelsCount: toNum(dossier.residenceInfo.levelsCount),
          isOccupied: dossier.residenceInfo.isOccupied ?? undefined,
          notes: dossier.residenceInfo.notes ?? undefined,
        }
      : undefined,
    chantierInfo: dossier.chantierInfo
      ? {
          siteName: dossier.chantierInfo.siteName ?? undefined,
          addressLine1: dossier.chantierInfo.addressLine1 ?? undefined,
          addressLine2: dossier.chantierInfo.addressLine2 ?? undefined,
          postalCode: dossier.chantierInfo.postalCode ?? undefined,
          city: dossier.chantierInfo.city ?? undefined,
          accessNotes: dossier.chantierInfo.accessNotes ?? undefined,
          safetyNotes: dossier.chantierInfo.safetyNotes ?? undefined,
          expectedStartDate: toISODate(dossier.chantierInfo.expectedStartDate) as unknown as Date,
          expectedEndDate: toISODate(dossier.chantierInfo.expectedEndDate) as unknown as Date,
        }
      : undefined,
    adminInfo: dossier.adminInfo
      ? {
          permitReference: dossier.adminInfo.permitReference ?? undefined,
          permitFiledAt: toISODate(dossier.adminInfo.permitFiledAt) as unknown as Date,
          permitGrantedAt: toISODate(dossier.adminInfo.permitGrantedAt) as unknown as Date,
          insurancePolicy: dossier.adminInfo.insurancePolicy ?? undefined,
          projectBudgetAmount: toNum(dossier.adminInfo.projectBudgetAmount),
          estimatedWorksAmount: toNum(dossier.adminInfo.estimatedWorksAmount),
          notes: dossier.adminInfo.notes ?? undefined,
        }
      : undefined,
    missions: defaultMissions,
  };

  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name }));

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/dossiers" className="hover:text-[var(--text)]">
          Dossiers
        </Link>
        <span>/</span>
        <Link
          href={`/dossiers/${id}`}
          className="hover:text-[var(--text)]"
        >
          {dossier.reference}
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Modifier</span>
      </div>
      <SectionHeader
        title="Modifier le dossier"
        description={dossier.title}
      />
      <div className="mt-8">
        <DossierForm
          clients={clientOptions}
          defaultValues={defaultValues}
          dossierId={id}
          onSubmit={async (data) => {
            const result = await updateDossierAction(id, data);
            if (!result) throw new Error("Erreur lors de la mise à jour");
            return result;
          }}
        />
      </div>
    </PageContainer>
  );
}
