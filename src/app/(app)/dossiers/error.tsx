"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Button, ButtonLink } from "@/components/ui/button";

export default function DossiersError({
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
    <PageContainer>
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-sm text-[var(--text-muted)]">
          Une erreur est survenue lors du chargement des dossiers.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={reset}>
            Réessayer
          </Button>
          <ButtonLink href="/dossiers" variant="outline">
            Retour aux dossiers
          </ButtonLink>
        </div>
      </div>
    </PageContainer>
  );
}
