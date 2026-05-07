import { db } from '@/lib/db';
import { loginSchema } from '@/lib/zod';
import bcryptjs from 'bcryptjs';
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { RoleEnum } from '@prisma/client';

export default {
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
          throw new Error('Invalid credentials');
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
          throw new Error('Invalid credentials');
        }

        if (!user.isActive || user.deletedLogic) {
          throw new Error('Usuario deshabilitado');
        }

        const isValid = await bcryptjs.compare(data.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        const userData = {
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

        return userData;
      },
    }),
  ],
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
        token.roles = user.roles as RoleEnum[];
        if (user.company) {
          token.company = user.company;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as RoleEnum[]) || [];
        if (token.company) {
          session.user.company = token.company as any;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
