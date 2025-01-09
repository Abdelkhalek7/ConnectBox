import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;

    // Log the current token for debugging
    console.log("Current token:", token);
    // If no token is found, block the request
    if (!token) {
      console.error("No token found");
      return new Response("Unauthorized", { status: 401 });
    }
    const expiresAt = token.expiresAt as number;
    if (expiresAt * 1000 < Date.now()) {
      console.log("middleware Access token has expired, refreshing...");
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Authorize all requests with a valid token
        return Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login).*)", // Matches everything except `/api/auth/*` and `/login`
  ],
};
