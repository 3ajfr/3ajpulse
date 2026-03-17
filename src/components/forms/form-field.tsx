import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  name,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[var(--text)]"
      >
        {label}
        {required && <span className="text-[var(--error)]"> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm outline-none transition placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 disabled:opacity-50";

export function FormInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(inputBase, className)}
      {...props}
    />
  );
}

export function FormSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(inputBase, "pr-9", className)}
      {...props}
    />
  );
}

export function FormTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        inputBase,
        "min-h-[80px] resize-y py-2.5",
        className
      )}
      {...props}
    />
  );
}
