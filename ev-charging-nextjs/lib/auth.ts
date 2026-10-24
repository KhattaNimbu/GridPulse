import type { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { auditLog } from './logger';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? process.env.GITHUB_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email ?? `${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
          role: 'DRIVER' as Role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'DRIVER' as Role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'github' || account?.provider === 'google') {
          const email = user.email?.toLowerCase().trim();
          if (email) {
            let dbUser = await prisma.user.findUnique({
              where: { email },
            });

            if (!dbUser) {
              dbUser = await prisma.user.create({
                data: {
                  email,
                  name: user.name || (account.provider === 'github' ? 'GitHub User' : 'Google User'),
                  role: 'DRIVER',
                  passwordHash: '',
                },
              });
            }

            token.role = dbUser.role;
            token.userId = dbUser.id;
          }
        } else {
          token.role = user.role;
          token.userId = user.id;
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'github' || account?.provider === 'google') {
          const email = user.email?.toLowerCase().trim();
          if (!email) {
            return false;
          }
          const dbUser = await prisma.user.findUnique({ where: { email } });
          await auditLog('sign_in', { userId: dbUser?.id ?? user?.id, email: user?.email, provider: account.provider });
          return true;
        }
        await auditLog('sign_in', { userId: user?.id, email: user?.email, provider: 'credentials' });
      } catch {}
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === 'string' ? token.userId : '';
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.user.role !== role) {
    throw new Error('Forbidden');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!adminEmails.includes(session.user.email ?? '')) {
    throw new Error('Forbidden');
  }
  return session;
}
