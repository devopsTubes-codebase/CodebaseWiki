import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loadRootEnvLocal } from '@/lib/env/loadRootEnv';

loadRootEnvLocal();

export function resolveUseSecureCookies(nextauthUrl = process.env.NEXTAUTH_URL): boolean {
  if (!nextauthUrl) {
    return process.env.NODE_ENV === 'production';
  }

  try {
    return new URL(nextauthUrl).protocol === 'https:';
  } catch {
    return process.env.NODE_ENV === 'production';
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret',
  useSecureCookies: resolveUseSecureCookies(),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Development Credentials',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const userId = credentials?.userId?.trim();
        if (!userId) {
          return null;
        }

        return {
          id: userId,
          email: credentials?.email?.trim() || undefined,
          name: credentials?.name?.trim() || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
