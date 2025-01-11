import { google } from "googleapis";

export const POST = async (request: Request) => {
  const { messageId, accessToken } = await request.json();
  console.log("🚀 ~ POST ~ messageId:", messageId);

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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Failed to create a new quote", { status: 500 });
  }
};
