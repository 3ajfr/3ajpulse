"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6">
      <p className="text-center text-sm text-[var(--text-muted)]">
        Une erreur est survenue lors du chargement du tableau de bord.
      </p>
      <Button variant="secondary" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
