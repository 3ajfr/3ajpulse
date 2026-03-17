"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, ListTodo, Flag, Clock, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const dossierNavItems = [
  { href: "overview", label: "Vue d'ensemble", icon: FileText },
  { href: "tasks", label: "Tâches", icon: ListTodo },
  { href: "milestones", label: "Jalons", icon: Flag },
  { href: "time", label: "Temps", icon: Clock },
  { href: "invoices", label: "Factures", icon: Receipt },
];

interface DossierNavProps {
  dossierId: string;
  dossierRef: string;
  className?: string;
}

export function DossierNav({
  dossierId,
  dossierRef,
  className,
}: DossierNavProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-6",
        className
      )}
    >
      <div className="flex items-center gap-2 py-3 pr-4 text-sm text-[var(--text-muted)]">
        <span className="font-medium text-[var(--text)]">{dossierRef}</span>
      </div>
      <nav className="flex gap-0.5">
        {dossierNavItems.map((item) => {
          const basePath = `/dossiers/${dossierId}`;
          const href = item.href === "overview" ? basePath : `${basePath}/${item.href}`;
          const isActive =
            item.href === "overview"
              ? pathname === basePath
              : pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--surface)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface)]/50 hover:text-[var(--text)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
