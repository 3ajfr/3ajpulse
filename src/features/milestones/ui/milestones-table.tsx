"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TableWrapper,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table-wrapper";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { markMilestoneCompleteAction } from "@/features/milestones/server/actions";

const statusLabels: Record<string, string> = {
  PLANNED: "Prévu",
  IN_PROGRESS: "En cours",
  DONE: "Terminé",
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

const statusVariant: Record<string, "success" | "warning" | "neutral" | "info" | "error"> = {
  PLANNED: "neutral",
  IN_PROGRESS: "info",
  DONE: "success",
  CANCELLED: "neutral",
};

function MarkCompleteButton({
  milestoneId,
  onComplete,
}: {
  milestoneId: string;
  onComplete: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        await markMilestoneCompleteAction(milestoneId);
        onComplete();
        setIsPending(false);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--success)] disabled:opacity-50"
      title="Marquer comme terminé"
    >
      <Check className="h-4 w-4" />
    </button>
  );
}

type MilestoneRow = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | string | null;
  phase: string | null;
  dossier: { id: string; reference: string; title: string; phase: string };
};

export function MilestonesTable({ milestones }: { milestones: MilestoneRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dossierId = searchParams.get("dossier") ?? "";
  const phase = searchParams.get("phase") ?? "";
  const status = searchParams.get("status") ?? "";
  const dueFilter = searchParams.get("due") ?? "";
  const sort = searchParams.get("sort") ?? "dueDate";
  const order = searchParams.get("order") ?? "asc";

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`/milestones?${params.toString()}`);
  }

  function toggleSort(col: string) {
    updateParams({
      sort: col,
      order: sort === col && order === "desc" ? "asc" : "desc",
    });
  }

  function renderSortIcon(col: string) {
    if (sort !== col) return null;
    return order === "asc" ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
    );
  }

  const filtered = milestones.filter((m) => {
    if (dossierId && m.dossier.id !== dossierId) return false;
    const mPhase = m.phase ?? m.dossier.phase;
    if (phase && mPhase !== phase) return false;
    if (status && m.status !== status) return false;
    if (dueFilter && m.dueDate) {
      const due = new Date(m.dueDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      if (dueFilter === "overdue" && due >= today) return false;
      if (dueFilter === "this_week" && (due < today || due > weekEnd)) return false;
      if (dueFilter === "this_month" && (due < today || due > monthEnd)) return false;
    }
    if (dueFilter === "no_date" && m.dueDate) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "phase":
        cmp = (a.phase ?? a.dossier.phase).localeCompare(b.phase ?? b.dossier.phase);
        break;
      case "dueDate":
        cmp =
          (a.dueDate ? new Date(a.dueDate).getTime() : 0) -
          (b.dueDate ? new Date(b.dueDate).getTime() : 0);
        break;
      case "dossier":
        cmp = a.dossier.reference.localeCompare(b.dossier.reference);
        break;
      default:
        return 0;
    }
    return order === "asc" ? cmp : -cmp;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <select
          value={dossierId}
          onChange={(e) => updateParams({ dossier: e.target.value })}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="">Tous les dossiers</option>
          {Array.from(
            new Map(milestones.map((m) => [m.dossier.id, m.dossier])).values()
          ).map((d) => (
            <option key={d.id} value={d.id}>
              {d.reference} — {d.title}
            </option>
          ))}
        </select>
        <select
          value={phase}
          onChange={(e) => updateParams({ phase: e.target.value })}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="">Toutes les phases</option>
          {Object.entries(phaseLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={dueFilter}
          onChange={(e) => updateParams({ due: e.target.value })}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="">Toutes les échéances</option>
          <option value="overdue">En retard</option>
          <option value="this_week">Cette semaine</option>
          <option value="this_month">Ce mois</option>
          <option value="no_date">Sans date</option>
        </select>
      </div>

      <TableWrapper>
        <TableHeader>
          <TableHeaderCell><span className="sr-only">Actions</span></TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("title")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Jalon
              {renderSortIcon("title")}
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("dossier")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Dossier
              {renderSortIcon("dossier")}
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("phase")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Phase
              {renderSortIcon("phase")}
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("status")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Statut
              {renderSortIcon("status")}
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("dueDate")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Échéance
              {renderSortIcon("dueDate")}
            </button>
          </TableHeaderCell>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
              >
                Aucun jalon trouvé
              </td>
            </tr>
          ) : (
            sorted.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="w-10">
                  {m.status !== "DONE" && m.status !== "CANCELLED" && (
                    <MarkCompleteButton
                      milestoneId={m.id}
                      onComplete={() => router.refresh()}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/milestones/${m.id}/edit`}
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    {m.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dossiers/${m.dossier.id}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {m.dossier.reference}
                  </Link>
                </TableCell>
                <TableCell>
                  {phaseLabels[m.phase ?? m.dossier.phase] ?? m.phase ?? m.dossier.phase}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[m.status] ?? "neutral"}>
                    {statusLabels[m.status] ?? m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[var(--text-muted)]">
                  {formatDate(m.dueDate)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableWrapper>
    </div>
  );
}
