import db from "@/lib/db";
import { sendEmail } from "@/actions/sendEmails";
import refreshAccessToken from "@/lib/refreshAccessToken";

export async function processScheduledEmails() {
  try {
    const now = new Date();
    // Find all scheduled emails that are due and not yet sent
    const pending = await db.scheduledEmail.findMany({
      where: {
        scheduledAt: { lte: now },
        sent: false,
      },
    });

    if (pending.length === 0) return;

    console.log(`Found ${pending.length} scheduled email(s) to process.`);

    for (const email of pending) {
      try {
        // Find the user's linked Google OAuth account
        const account = await db.account.findFirst({
          where: { userId: email.userId, provider: "google" },
        });

        let accessToken = account?.access_token || "mock-access-token";

        if (account) {
          // If Google OAuth account exists, ensure token is fresh
          const expiresAt = account.expires_at ?? 0;
          if (expiresAt < Math.floor(Date.now() / 1000)) {
            console.log(`Refreshing access token for scheduled email user ${email.userId}`);
            const sessionDummy = {
              user: { id: email.userId },
              accessToken: account.access_token || undefined,
            };
            const newAccessToken = await refreshAccessToken(sessionDummy, account);
            if (newAccessToken) {
              accessToken = newAccessToken;
            }
          }
        }

        // Get user profile details for 'From' fields
        const user = await db.user.findUnique({
          where: { id: email.userId },
        });

        const senderName = user?.name || "ConnectBox User";
        const senderEmail = user?.email || "user@connectbox.com";

        // Send the email
        await sendEmail({
          name: senderName,
          email: senderEmail,
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          htmlContent: email.htmlContent,
          accessToken,
        });

        // Mark as sent in the database
        await db.scheduledEmail.update({
          where: { id: email.id },
          data: { sent: true },
        });

        console.log(`Successfully sent scheduled email ID ${email.id}`);
      } catch (err) {
        console.error(`Failed to process scheduled email ID ${email.id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error in processScheduledEmails worker:", error);
  }
}
