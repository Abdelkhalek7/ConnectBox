import "@/lib/patchBuffer";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import crypto from "crypto";
import refreshAccessToken from "./refreshAccessToken";
import db from "./db";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const hashedPassword = hashPassword(credentials.password);

        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Auto register credentials user
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              password: hashedPassword,
            },
          });
        } else {
          // If user exists and has a password set, verify it
          if (user.password && user.password !== hashedPassword) {
            throw new Error("Invalid password.");
          }
          // If user signed up with OAuth before and password wasn't set, set it now
          if (!user.password) {
            await db.user.update({
              where: { id: user.id },
              data: { password: hashedPassword },
            });
          }
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.expires_at = account.expires_at;
      } else if (token.id) {
        // If not on sign in, check if user has a linked Google account
        const dbAccount = await db.account.findFirst({
          where: { userId: token.id as string, provider: "google" },
          select: { access_token: true, expires_at: true },
        });
        if (dbAccount) {
          token.accessToken = dbAccount.access_token;
          token.expires_at = dbAccount.expires_at;
        } else {
          // No linked Google account, assign a mock access token
          token.accessToken = "mock-access-token";
          token.expires_at = Math.floor(Date.now() / 1000) + 3600 * 24 * 365; // 1 year
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      session.accessToken = token.accessToken as string;
      session.expires_at = token.expires_at as number;

      // Only attempt to refresh if using a real Google OAuth token
      if (
        session.accessToken &&
        session.accessToken !== "mock-access-token" &&
        session.expires_at &&
        session.expires_at < Math.floor(Date.now() / 1000)
      ) {
        console.log("Access token has expired, refreshing...");
        const account = await db.account.findFirst({
          where: { userId: token.id as string, provider: "google" },
        });
        if (account) {
          session.accessToken = await refreshAccessToken(session, account);
          session.expires = (Date.now() + 3600 * 1000).toString();
        }
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
