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
}: {
  name: string;
  email: string;
  to: string[]; // Array of email addresses for "To"
  cc?: string[]; // Array of email addresses for "CC" (optional)
  bcc?: string[]; // Array of email addresses for "BCC" (optional)
  subject: string;
  htmlContent: string; // HTML content for the email body
  accessToken: string;
}) {
  console.log("🚀 ~ accessToken:", accessToken);
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  // Initialize the Gmail API
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Build the raw email message
  const headers = [
    `From: ${name} ${email}`,
    `To: ${to.join(", ")}`,
    // cc ? `Cc: ${cc.join(", ")}` : "",
    // bcc ? `Bcc: ${bcc.join(", ")}` : "",
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
  ]
    .filter(Boolean) // Remove empty lines for CC/BCC if not provided
    .join("\n");

  const rawMessage = `${headers}\n\n${htmlContent}`;

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
