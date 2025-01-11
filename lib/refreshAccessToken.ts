/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/authUtils.ts

import db from "@/lib/db"; // Adjust the path based on your project structure

export default async function refreshAccessToken(session?: any, account?: any) {
  if (!account) {
    account = await db.account.findFirst({
      where: {
        userId: session.user.id,
      },
    });
  }
  // Check if the access token has expired
  try {
    // Make a request to refresh the token

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: account.refresh_token as string,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      throw new Error(tokens.error || "Failed to refresh token");
    }

    // Update the token with new values
    if (tokens.refresh_token) {
      account.refreshToken = tokens.refresh_token;
    }

    // Update the session with the new access token
    session.expiresAt = Math.floor(Date.now() / 1000 + tokens.expires_in);

    session.accessToken = tokens.access_token;

    // Update the database with the new tokens using Prisma
    await db.account.updateMany({
      where: {
        providerAccountId: account.providerAccountId,
      },
      data: {
        access_token: tokens.access_token,
        expires_at: session.expiresAt,
        refresh_token: account.refreshToken,
      },
    });

    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing access token", error);
    if (session) {
      session.error = "RefreshAccessTokenError";
    }
  }

  // Return the existing access token if it hasn't expired
  return session.accessToken;
}
