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
    jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    // session() se utiliza para agregar la información del token a la sesión del usuario,
    // lo que hace que esté disponible en el cliente.
    session({ session, token }) {
      if (session.user) {
        session.user.roles = token.roles as RoleEnum[];
      }
      return session;
    },
  },
});
