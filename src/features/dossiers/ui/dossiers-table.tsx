"use client";

import { useCallback, useEffect, useState } from "react";
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
import { formatCurrency, formatDate } from "@/lib/format";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "neutral" | "info"> =
  {
    ACTIVE: "success",
    DORMANT: "neutral",
    ARCHIVED: "neutral",
    CANCELLED: "neutral",
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

type DossierRow = {
  id: string;
  reference: string;
  title: string;
  status: string;
  phase: string;
  client: { name: string } | null;
  totalFeeAmount: number;
  totalPaid: number;
  nextMilestone?: { title: string; dueDate?: Date | string | null } | null;
};

export function DossiersTable({ dossiers }: { dossiers: DossierRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const phase = searchParams.get("phase") ?? "";
  const sort = searchParams.get("sort") ?? "reference";
  const order = searchParams.get("order") ?? "asc";

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const debouncedSearch = useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set("q", value);
      else next.delete("q");
      router.push(`/dossiers?${next.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== q) debouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, debouncedSearch, q]);

  const filtered = dossiers.filter((d) => {
    if (q) {
      const term = q.toLowerCase();
      const match =
        d.reference.toLowerCase().includes(term) ||
        d.title.toLowerCase().includes(term) ||
        (d.client?.name ?? "").toLowerCase().includes(term);
      if (!match) return false;
    }
    if (status && d.status !== status) return false;
    if (phase && d.phase !== phase) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "reference":
        cmp = a.reference.localeCompare(b.reference);
        break;
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "phase":
        cmp = a.phase.localeCompare(b.phase);
        break;
      case "feeAmount":
        cmp = a.totalFeeAmount - b.totalFeeAmount;
        break;
      case "collected":
        cmp = a.totalPaid - b.totalPaid;
        break;
      case "nextMilestone":
        cmp = (a.nextMilestone?.title ?? "").localeCompare(
          b.nextMilestone?.title ?? ""
        );
        break;
      default:
        return 0;
    }
    return order === "asc" ? cmp : -cmp;
  });

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`/dossiers?${params.toString()}`);
  }

  function toggleSort(col: string) {
    updateParams({
      sort: col,
      order: sort === col && order === "desc" ? "asc" : "desc",
    });
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sort !== col) return null;
    return order === "asc" ? (
      <ChevronUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type="search"
            placeholder="Rechercher référence, titre, client…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="DORMANT">Dormant</option>
            <option value="ARCHIVED">Archivé</option>
            <option value="CANCELLED">Annulé</option>
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
        </div>
      </div>

      <TableWrapper>
        <TableHeader>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("reference")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Référence
              <SortIcon col="reference" />
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("title")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Titre
              <SortIcon col="title" />
            </button>
          </TableHeaderCell>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("status")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Statut
              <SortIcon col="status" />
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("phase")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Phase
              <SortIcon col="phase" />
            </button>
          </TableHeaderCell>
          <TableHeaderCell>
            <button
              type="button"
              onClick={() => toggleSort("nextMilestone")}
              className="flex items-center font-medium hover:text-[var(--accent)]"
            >
              Prochain jalon
              <SortIcon col="nextMilestone" />
            </button>
          </TableHeaderCell>
          <TableHeaderCell align="right">
            <button
              type="button"
              onClick={() => toggleSort("feeAmount")}
              className="ml-auto flex items-center font-medium hover:text-[var(--accent)]"
            >
              Honoraires
              <SortIcon col="feeAmount" />
            </button>
          </TableHeaderCell>
          <TableHeaderCell align="right">
            <button
              type="button"
              onClick={() => toggleSort("collected")}
              className="ml-auto flex items-center font-medium hover:text-[var(--accent)]"
            >
              Encaissé
              <SortIcon col="collected" />
            </button>
          </TableHeaderCell>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
              >
                Aucun dossier trouvé
              </td>
            </tr>
          ) : (
            sorted.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Link
                    href={`/dossiers/${d.id}`}
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    {d.reference}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell>{d.client?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[d.status] ?? "neutral"}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell>{phaseLabels[d.phase] ?? d.phase}</TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="text-[var(--text)]">
                      {d.nextMilestone?.title ?? "—"}
                    </span>
                    {d.nextMilestone?.dueDate && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatDate(d.nextMilestone.dueDate)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell align="right" className="font-medium">
                  {formatCurrency(d.totalFeeAmount)}
                </TableCell>
                <TableCell align="right" className="font-medium">
                  {formatCurrency(d.totalPaid)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableWrapper>
    </div>
  );
}
