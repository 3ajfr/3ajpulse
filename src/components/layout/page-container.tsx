import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-[1400px] px-6 py-6 sm:px-8 sm:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
