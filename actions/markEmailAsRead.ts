import { google } from "googleapis";

export default async function markEmailAsRead(
  messageId: string,
  accessToken: string,
) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Initialize the Gmail API
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
    return { success: true };
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    throw new Error("Failed to update the email");
  }
}
