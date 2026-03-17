import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/features/auth/server/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const { error } = await searchParams;

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-8 shadow-[var(--shadow-elevated)]">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-faint)]">
            3AJPULSE
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)]">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Accès sécurisé au workspace de gestion opérationnelle.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 px-3 py-2 text-sm text-[var(--error)]">
            {error === "validation"
              ? "Merci de vérifier l'adresse e-mail et le mot de passe."
              : "Adresse e-mail ou mot de passe incorrect."}
          </div>
        )}

        <form action={signInAction} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text)]" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="nom@entreprise.fr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text)]" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="••••••••"
            />
          </div>

          <Button className="w-full" type="submit">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
