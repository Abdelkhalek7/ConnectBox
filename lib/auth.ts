import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import refreshAccessToken from "./refreshAccessToken";
import db from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // prompt: "consent",
          access_type: "offline",
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send  https://www.googleapis.com/auth/gmail.modify",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, user }) {
      const account = await db.account.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          providerAccountId: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
      });

      if (!account) {
        console.error("Account not found");
        return session;
      }

      if (session.user) {
        session.user.id = user.id as string;
      }
      if (!session.accessToken) {
        session.accessToken = account.access_token as string;

        session.expires_at = account.expires_at ?? 0;
      }

      // Ensure expires_at is a valid number before comparing
      const expiresAt = session.expires_at as unknown as number;

      if (expiresAt < Math.floor(Date.now() / 1000)) {
        console.log("Access token has expired, refreshing...");
        // Refresh the access token
        session.accessToken = await refreshAccessToken(session, account);

        if (!session.accessToken) {
          console.error("Failed to refresh access token");
          // Optionally, you can clear the session or handle the error here
          return session; // session may not be valid at this point
        }

        // After refreshing the token, make sure the session expiration is updated correctly
        session.expires = (Date.now() + 3600 * 1000).toString(); // Set expires to 1 hour from now
        console.log("Refreshed access token:", session.accessToken);
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
