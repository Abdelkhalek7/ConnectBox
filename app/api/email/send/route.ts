import "@/lib/patchBuffer";
import { sendEmail } from "@/actions/sendEmails";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { processScheduledEmails } from "@/lib/processScheduledEmails";

export const POST = async (request: Request) => {
  const {
    name,
    email,
    to,
    cc,
    bcc,
    subject,
    htmlContent,
    accessToken,
    attachments,
    scheduledAt,
  } = await request.json();

  if (!to || !subject || !htmlContent || !accessToken) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  // Non-blocking trigger to process any scheduled emails due now
  processScheduledEmails().catch(console.error);

  try {
    if (scheduledAt) {
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.id) {
        return new Response(
          JSON.stringify({ error: "Authentication required to schedule emails." }),
          { status: 401 }
        );
      }

      const scheduledRecord = await db.scheduledEmail.create({
        data: {
          userId: session.user.id,
          to,
          cc: cc || [],
          bcc: bcc || [],
          subject,
          htmlContent,
          scheduledAt: new Date(scheduledAt),
          sent: false,
        },
      });

      return new Response(
        JSON.stringify({ success: true, scheduled: true, record: scheduledRecord }),
        { status: 200 }
      );
    }

    const result = await sendEmail({
      name,
      email,
      to,
      cc,
      bcc,
      subject,
      htmlContent,
      accessToken,
      attachments,
    });

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Failed to send the email", { status: 500 });
  }
};
