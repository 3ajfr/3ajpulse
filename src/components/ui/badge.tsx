import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20",
  success:
    "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20",
  warning:
    "bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20",
  error:
    "bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20",
  info: "bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/20",
  neutral:
    "bg-[var(--text-faint)]/10 text-[var(--text-muted)] border border-[var(--border-subtle)]",
  outline:
    "bg-transparent text-[var(--text-muted)] border border-[var(--border)]",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
