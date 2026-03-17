const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: () =>
    isProduction
      ? requireEnv("DATABASE_URL")
      : process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/3ajpulse?schema=public",
  authSecret: () =>
    isProduction
      ? requireEnv("AUTH_SECRET")
      : process.env.AUTH_SECRET || "dev-only-auth-secret-change-me-before-production",
};
