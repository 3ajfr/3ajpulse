"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  ListTodo,
  Flag,
  Clock,
  FileText,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dossiers", label: "Dossiers", icon: FolderOpen },
  { href: "/tasks", label: "Tâches", icon: ListTodo },
  { href: "/milestones", label: "Jalons", icon: Flag },
  { href: "/time", label: "Temps", icon: Clock },
  { href: "/invoices", label: "Factures", icon: FileText },
  { href: "/payments", label: "Paiements", icon: Receipt },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border-subtle)] px-5">
        <span className="text-lg font-semibold tracking-tight text-[var(--text)]">
          3AJPULSE
        </span>
      </div>
      <nav className="flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
