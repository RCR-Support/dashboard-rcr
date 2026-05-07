// Edge-safe auth config — NO bcryptjs, NO db/Prisma imports.
// This file is used in the middleware (Edge Runtime).
// The Credentials provider (with bcryptjs + db) lives in auth.ts (Node.js runtime only).
import type { NextAuthConfig } from 'next-auth';

export default {
  providers: [],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        if (user.company) {
          token.company = user.company;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as import('@prisma/client').RoleEnum[]) || [];
        if (token.company) {
          session.user.company = token.company as any;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
