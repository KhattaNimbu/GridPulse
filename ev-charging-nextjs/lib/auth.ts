import type { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { auditLog } from './logger';

async function getVerifiedGitHubEmail(accessToken: string | undefined) {
  if (!accessToken) {
    return null;
  }

  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`GitHub email verification failed with status ${response.status}`);
    return null;
  }

  const emails: unknown = await response.json();
  if (!Array.isArray(emails)) {
    return null;
  }

  const primaryEmail = emails.find((entry): entry is { email: string } => {
    if (typeof entry !== 'object' || entry === null) {
      return false;
    }

    return (
      'email' in entry &&
      typeof entry.email === 'string' &&
      'primary' in entry &&
      entry.primary === true &&
      'verified' in entry &&
      entry.verified === true
    );
  });

  return primaryEmail?.email.toLowerCase().trim() || null;
}

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
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: 'DRIVER' as Role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET ?? '',
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
          const oauthAccount = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: { user: true },
          });

          if (!oauthAccount) {
            throw new Error('OAuth account was not linked during sign-in');
          }

          token.role = oauthAccount.user.role;
          token.userId = oauthAccount.user.id;
        } else {
          token.role = user.role;
          token.userId = user.id;
        }
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' || account?.provider === 'google') {
        let email: string | null = null;
        if (account.provider === 'google') {
          if (
            profile &&
            'email_verified' in profile &&
            profile.email_verified === true &&
            user.email
          ) {
            email = user.email.toLowerCase().trim();
          }
        } else {
          email = await getVerifiedGitHubEmail(account.access_token);
        }

        if (!email) {
          return false;
        }

        const existingAccount = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        });

        let dbUser = existingAccount?.user;
        if (!dbUser) {
          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser?.passwordHash) {
            return false;
          }

          dbUser = await prisma.$transaction(async (transaction) => {
            const linkedUser =
              existingUser ??
              (await transaction.user.create({
                data: {
                  email,
                  name: user.name || (account.provider === 'github' ? 'GitHub User' : 'Google User'),
                  role: 'DRIVER',
                  passwordHash: '',
                },
              }));

            await transaction.oAuthAccount.create({
              data: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                userId: linkedUser.id,
              },
            });

            return linkedUser;
          });
        }

        try {
          await auditLog('sign_in', { userId: dbUser.id, email, provider: account.provider });
        } catch (error) {
          console.error('Failed to audit OAuth sign-in', error);
        }
        return true;
      }

      try {
        await auditLog('sign_in', { userId: user?.id, email: user?.email, provider: 'credentials' });
      } catch (error) {
        console.error('Failed to audit credential sign-in', error);
      }
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
