import { db } from '@/lib/db';
import { loginSchema } from '@/lib/zod';
import bcryptjs from 'bcryptjs';
import type { Session } from "next-auth";
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { RoleEnum } from "@prisma/client";

export default {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log("Credentials received:", credentials);

        const { data, success } = loginSchema.safeParse(credentials);

        if (!success) {
          console.log("Invalid credentials schema");
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
                role: true
              }
            }
          }
        });

        console.log("User from DB:", JSON.stringify(user, null, 2));

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcryptjs.compare(data.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Log del usuario completo para debugging
        console.log("Complete user data:", JSON.stringify(user, null, 2));

        const userData = {
          id: user.id,
          email: user.email || '',
          name: user.name || '',
          image: user.image || '',
          roles: user.roles.map(userRole => userRole.role.name as RoleEnum),
          company: user.company ? {
            id: user.company.id,
            name: user.company.name || '',
            phone: user.company.phone || ''
          } : undefined
        } as any;

        // Log de los datos que se van a retornar
        console.log("Returning user data:", JSON.stringify(userData, null, 2));
        
        return userData;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('JWT Callback - Input:', {
        hasUser: !!user,
        trigger,
        hasSession: !!session,
        currentToken: token
      });

      if (user) {
        // Solo actualizamos el token cuando tenemos datos del usuario
        token.id = user.id;
        token.roles = user.roles as RoleEnum[];
        
        if (user.company) {
          token.company = {
            id: user.company.id,
            name: user.company.name,
            phone: user.company.phone,
            rut: user.company.rut,
            status: user.company.status,
            url: user.company.url,
            city: user.company.city
          };
        }
      }

      console.log('JWT Callback - Output Token:', JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Input:', {
        hasSession: !!session,
        token: JSON.stringify(token, null, 2)
      });

      if (!session?.user) return session;

      // Actualizamos el usuario de la sesión
      session.user.id = token.id as string;
      session.user.roles = token.roles as RoleEnum[];
      if (token.company) {
        session.user.company = token.company as Session['user']['company'];
      }

      console.log('Session Callback - Final Session:', JSON.stringify(session, null, 2));
      return session;
    }
  },
} satisfies NextAuthConfig;
