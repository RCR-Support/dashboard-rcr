import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { RoleEnum } from '@prisma/client';
import Credentials from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';

import authConfig from '@/auth.config';
import { db } from './lib/db';
import { loginSchema } from '@/lib/zod';

// Extender los tipos de next-auth
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles: RoleEnum[];
      companyId?: string; // Agregado para facilitar acceso
      company?: {
        id: string;
        name: string;
        phone?: string;
      };
      displayName?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** Extend the built-in types for JWT */
  interface JWT {
    id: string;
    roles: RoleEnum[];
    companyId?: string;
    company?: {
      id: string;
      name: string;
      phone?: string;
    };
    displayName?: string;
    /** Timestamp (ms) when token data was last refreshed from DB */
    refreshedAt?: number;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { data, success } = loginSchema.safeParse(credentials);

        if (!success) {
          throw new Error('Credenciales inválidas');
        }

        const user = await db.user.findUnique({
          where: {
            email: data.email.toLowerCase(),
          },
          include: {
            company: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error('Credenciales inválidas');
        }

        if (!user.isActive || user.deletedLogic) {
          throw new Error('Usuario deshabilitado');
        }

        const isValid = await bcryptjs.compare(data.password, user.password);
        if (!isValid) {
          throw new Error('Credenciales inválidas');
        }

        return {
          id: user.id,
          email: user.email || '',
          name: user.name || '',
          image: user.image || '',
          roles: user.roles.map(userRole => userRole.role.name as RoleEnum),
          company: user.company
            ? {
                id: user.company.id,
                name: user.company.name || '',
                phone: user.company.phone || '',
              }
            : undefined,
        } as any;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      // Obtener datos completos del usuario incluyendo la compañía
      const fullUser = await db.user.findUnique({
        where: { id: user.id },
        include: { company: true },
      });

      if (fullUser) {
        user.displayName = fullUser.displayName;
        
        if (fullUser.company) {
          user.company = {
            id: fullUser.company.id,
            name: fullUser.company.name || '',
            phone: fullUser.company.phone || '',
          };
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'signIn' && user) {
        if (user.id && user.roles) {
          token.id = user.id;
          token.roles = user.roles;
          token.company = user.company;
          token.companyId = user.company?.id;
          token.displayName = user.displayName;
          token.refreshedAt = Date.now();
        }
      } else if (trigger === 'update' && session?.user?.company) {
        token.company = session.user.company;
        token.companyId = session.user.company.id;
      }

      // Refresh token data from DB every hour to detect role/company changes
      const ONE_HOUR = 60 * 60 * 1000;
      if (!token.refreshedAt || Date.now() - token.refreshedAt > ONE_HOUR) {
        try {
          const freshUser = await db.user.findUnique({
            where: { id: token.id },
            include: {
              company: true,
              roles: { include: { role: true } },
            },
          });

          if (freshUser) {
            token.roles = freshUser.roles.map(ur => ur.role.name as RoleEnum);
            token.displayName = freshUser.displayName;
            token.companyId = freshUser.companyId || undefined;
            token.company = freshUser.company
              ? {
                  id: freshUser.company.id,
                  name: freshUser.company.name || '',
                  phone: freshUser.company.phone || '',
                }
              : undefined;
          }
          token.refreshedAt = Date.now();
        } catch (_) {
          // DB unavailable — keep stale token until next cycle
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.roles) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.companyId = token.companyId;
        session.user.displayName = token.displayName;
        if (token.company) {
          session.user.company = token.company;
        }
      }

      return session;
    },
  },
});
