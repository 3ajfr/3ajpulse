import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  trend,
  icon,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-card)]",
        "transition-shadow hover:shadow-[var(--shadow-elevated)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--text)]">
            {value}
          </p>
          {subtext && (
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {subtext}
            </p>
          )}
          {trend && (
            <span
              className={cn(
                "mt-1 inline-block text-xs font-medium",
                trend === "up" && "text-[var(--success)]",
                trend === "down" && "text-[var(--error)]",
                trend === "neutral" && "text-[var(--text-muted)]"
              )}
            >
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"}
            </span>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-muted)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
