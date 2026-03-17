import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@/lib/domain/enums";
import { signInSchema } from "@/features/auth/validation/auth-schemas";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { env } from "@/lib/env";

async function getDefaultMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env.authSecret(),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      name: "Identifiants",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsedCredentials.data.email },
          include: {
            memberships: {
              orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
              take: 1,
            },
          },
        });

        if (!user?.passwordHash || !user.isActive) {
          return null;
        }

        const passwordMatches = await verifyPassword(
          parsedCredentials.data.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        const membership = user.memberships[0];

        if (!membership) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            workspaceId: membership.workspaceId,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: membership.role as UserRole,
          workspaceId: membership.workspaceId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as typeof user & {
          role: UserRole;
          workspaceId: string;
        };

        token.sub = user.id;
        token.role = typedUser.role;
        token.workspaceId = typedUser.workspaceId;
      }

      if (token.sub && (!token.role || !token.workspaceId)) {
        const membership = await getDefaultMembership(token.sub);

        if (membership) {
          token.role = membership.role as UserRole;
          token.workspaceId = membership.workspaceId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub && token.role && token.workspaceId) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.workspaceId = token.workspaceId;
      }

      return session;
    },
    authorized({ auth: currentAuth, request: { nextUrl } }) {
      const isSignedIn = Boolean(currentAuth?.user);
      const isPublicPath =
        nextUrl.pathname === "/sign-in" ||
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname === "/favicon.ico";

      return isPublicPath || isSignedIn;
    },
  },
});
