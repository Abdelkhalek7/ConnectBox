import { google } from "googleapis";

export async function sendEmail({
  name,
  email,
  to,
  cc,
  bcc,
  subject,
  htmlContent,
  accessToken,
  attachments,
}: {
  name: string;
  email: string;
  to: string[]; // Array of email addresses for "To"
  cc?: string[]; // Array of email addresses for "CC" (optional)
  bcc?: string[]; // Array of email addresses for "BCC" (optional)
  subject: string;
  htmlContent: string; // HTML content for the email body
  accessToken: string;
  attachments?: { name: string; type: string; content: string }[]; // Array of base64 attachments
}) {
  console.log("🚀 ~ accessToken:", accessToken);

  if (accessToken === "mock-access-token") {
    console.log("Mock Mode: Sending email to", to, "with attachments:", attachments?.length || 0);
    return { success: true, messageId: "mock-" + Date.now().toString() };
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  // Initialize the Gmail API
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Build the raw email message
  let rawMessage = "";
  const boundary = "connectbox_boundary_" + Date.now().toString(16);

  const cleanTo = to.filter(Boolean);
  const cleanCc = cc?.filter(Boolean) || [];
  const cleanBcc = bcc?.filter(Boolean) || [];

  if (attachments && attachments.length > 0) {
    const headers = [
      `From: ${name} <${email}>`,
      `To: ${cleanTo.join(", ")}`,
      cleanCc.length > 0 ? `Cc: ${cleanCc.join(", ")}` : "",
      cleanBcc.length > 0 ? `Bcc: ${cleanBcc.join(", ")}` : "",
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ]
      .filter(Boolean)
      .join("\n");

    rawMessage += `${headers}\n\n`;
    rawMessage += `--${boundary}\n`;
    rawMessage += `Content-Type: text/html; charset=utf-8\n`;
    rawMessage += `Content-Transfer-Encoding: 7bit\n\n`;
    rawMessage += `${htmlContent}\n\n`;

    for (const attachment of attachments) {
      rawMessage += `--${boundary}\n`;
      rawMessage += `Content-Type: ${attachment.type}; name="${attachment.name}"\n`;
      rawMessage += `Content-Disposition: attachment; filename="${attachment.name}"\n`;
      rawMessage += `Content-Transfer-Encoding: base64\n\n`;
      rawMessage += `${attachment.content}\n\n`;
    }

    rawMessage += `--${boundary}--`;
  } else {
    const headers = [
      `From: ${name} <${email}>`,
      `To: ${cleanTo.join(", ")}`,
      cleanCc.length > 0 ? `Cc: ${cleanCc.join(", ")}` : "",
      cleanBcc.length > 0 ? `Bcc: ${cleanBcc.join(", ")}` : "",
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
    ]
      .filter(Boolean)
      .join("\n");

    rawMessage = `${headers}\n\n${htmlContent}`;
  }

  // Encode the message in Base64
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-") // Gmail API requires replacing special characters
    .replace(/\//g, "_");

  try {
    // Send the email
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return result.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
