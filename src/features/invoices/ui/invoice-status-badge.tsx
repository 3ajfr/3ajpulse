import { Badge } from "@/components/ui/badge";
import { getInvoiceStatusTone } from "@/features/invoices/lib/finance";
import type { InvoiceStatus } from "@/lib/domain/enums";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  dueDate?: Date | string | null;
}

export function InvoiceStatusBadge({
  status,
  dueDate,
}: InvoiceStatusBadgeProps) {
  const tone = getInvoiceStatusTone({ status, dueDate });

  return <Badge variant={tone.variant}>{tone.label}</Badge>;
}
