import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { RoleEnum } from '@prisma/client';

import authConfig from '@/auth.config';

import { db } from './lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      // Obtener datos completos del usuario incluyendo la compañía
      const fullUser = await db.user.findUnique({
        where: { id: user.id },
        include: { company: true }
      });

      if (fullUser?.company) {
        user.company = {
          id: fullUser.company.id,
          name: fullUser.company.name || '',
          phone: fullUser.company.phone || '',
        };
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      console.log("JWT callback - User:", JSON.stringify(user, null, 2));
      console.log("JWT callback - Trigger:", trigger);
      
      if (trigger === "signIn" && user) {
        // Durante el inicio de sesión, guardar todos los datos del usuario
        token.id = user.id;
        token.roles = user.roles;
        token.company = user.company;
      } else if (trigger === "update" && session?.user?.company) {
        // Actualizar el token si los datos de la sesión cambian
        token.company = session.user.company;
      }
      
      console.log("JWT callback - Final token:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Token:", JSON.stringify(token, null, 2));
      
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          roles: token.roles as RoleEnum[],
        };

        if (token.company) {
          session.user.company = token.company as {
            id: string;
            name: string;
            phone?: string;
          };
        }
      }
      
      console.log("Session callback - Final session:", JSON.stringify(session, null, 2));
      return session;
    },
  },
});
