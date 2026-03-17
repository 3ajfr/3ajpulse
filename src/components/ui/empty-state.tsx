import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-elevated)]/50 py-16 px-8 sm:py-20",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--text-faint)]">
          {icon}
        </div>
      )}
      <h3 className="text-center text-base font-medium text-[var(--text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-center text-sm text-[var(--text-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
