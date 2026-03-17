"use client";

import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  breadcrumb?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function Topbar({ title, breadcrumb, action, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {breadcrumb}
        {title && (
          <h1 className="truncate text-base font-semibold text-[var(--text)]">
            {title}
          </h1>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
