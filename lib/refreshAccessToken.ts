/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/authUtils.ts

import { connectToDatabase } from "@/lib/mongoose"; // Adjust this path based on your project structure
import Account from "@/models/Account"; // Adjust the path based on your project structure

export default async function refreshAccessToken(token: any, session?: any) {
  // Check if the access token has expired
  if (token.expiresAt * 1000 < Date.now()) {
    try {
      // Make a request to refresh the token
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken as string,
        }),
      });

      const tokens = await response.json();

      if (!response.ok) {
        throw new Error(tokens.error || "Failed to refresh token");
      }

      // Update the token with new values
      token.accessToken = tokens.access_token;
      token.expiresAt = Math.floor(Date.now() / 1000 + tokens.expires_in);
      if (tokens.refresh_token) {
        token.refreshToken = tokens.refresh_token;
      }

      // Update the session with the new access token
      if (session)
    {  session.accessToken = tokens.access_token;}

      // Update the database with the new tokens
      await connectToDatabase();
      await Account.updateOne(
        { providerAccountId: token.providerAccountId },
        {
          $set: {
            access_token: tokens.access_token,
            expires_at: token.expiresAt,
            refresh_token: token.refreshToken,
          },
        }
      );
      return tokens.access_token;
    } catch (error) {
      console.error("Error refreshing access token", error);
      if (session)
    {  session.error = "RefreshAccessTokenError";}
    }
  }
}
