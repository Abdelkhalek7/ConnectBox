import { google } from "googleapis";

interface MessagePart {
  body: {
    data?: string;
  };
  mimeType: string;
  parts?: MessagePart[];
}

interface MessagePayload {
  mimeType: string;
  body: { data?: string };
  parts?: MessagePart[];
  headers?: { name: string; value: string }[];
}

export interface MessageDto {
  id: string;
  payload: MessagePayload | null;
  snippet?: string;
  labelIds?: string[];
  threadId?: string;
  decodedBody?: string;
  subject?: string;
  from?: string;
  date?: string;
}

async function decodeBase64(base64String: string): Promise<string> {
  const buffer = Buffer.from(base64String, "base64");
  return buffer.toString("utf-8");
}

async function getMessages(
  access_token: string,
  category: string
): Promise<MessageDto[]> {
  try {
    // Initialize the OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: access_token,
    });

    // Initialize the Gmail API
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // List the user's messages (inbox, max 50 results)
    const labelIds = category && category !== "ALL" ? [category] : undefined;

    const listResponse = await gmail.users.messages.list({
      userId: "me",
      labelIds,
      maxResults: 10,
    });

    // const messages: MessageDto[] = [];
    // for (const message of listResponse.data.messages || []) {
    if (listResponse.data.messages) {
      const detailedMessages: MessageDto[] = await Promise.all(
        listResponse.data.messages.map(async (message) => {
          const messageDetailResponse = await gmail.users.messages.get({
            userId: "me",
            id: message.id!,
            format: "full", // Get the full content
          });

          const messageDto: MessageDto = {
            id: message.id!,
            threadId: message.threadId!,
            snippet: messageDetailResponse.data.snippet!,
            labelIds: messageDetailResponse.data.labelIds!,
            payload:
              (messageDetailResponse.data.payload as MessagePayload) || null,
          };

          // Extract headers like "Subject", "From", and "Date"
          if (messageDto.payload?.headers) {
            const headers = messageDto.payload.headers;
            messageDto.subject = headers.find(
              (h) => h.name === "Subject"
            )?.value;
            messageDto.from = headers.find((h) => h.name === "From")?.value;
            messageDto.date = headers.find((h) => h.name === "Date")?.value;
          }

          // Handle different MIME types and decode the body if necessary
          if (messageDto.payload) {
            const { mimeType, parts } = messageDto.payload;

            if (mimeType === "text/html" && messageDto.payload.body.data) {
              const decodedBody = await decodeBase64(
                messageDto.payload.body.data
              );
              messageDto.decodedBody = decodedBody;
            } else if (mimeType === "multipart/alternative") {
              for (const part of parts || []) {
                if (part.body?.data) {
                  const decodedBody = await decodeBase64(part.body.data);
                  part.body.data = decodedBody;
                  messageDto.decodedBody = decodedBody;
                }
              }
            } else if (
              mimeType === "multipart/mixed" &&
              parts &&
              parts[0]?.mimeType === "multipart/alternative"
            ) {
              for (const part of parts[0]?.parts || []) {
                if (part.body?.data) {
                  const decodedBody = await decodeBase64(part.body.data);
                  part.body.data = decodedBody;
                  messageDto.decodedBody = decodedBody;
                }
              }
            } else if (
              mimeType === "multipart/mixed" &&
              parts &&
              parts[0]?.mimeType === "text/html"
            ) {
              const decodedBody = await decodeBase64(
                parts[0]?.body?.data || ""
              );
              parts[0].body.data = decodedBody;
              messageDto.decodedBody = decodedBody;
            } else if (mimeType === "text/plain") {
              // Decode the base64 encoded body
              const decodedBody = await decodeBase64(
                messageDto.payload.body.data || ""
              );

              // parts[0].body.data = decodedBody;
              messageDto.decodedBody = decodedBody;
            }
          }
          return messageDto;
        })
      );

      return detailedMessages;
    }
    return [];

    // messages.push(messageDto);
    // Path to the JSON file
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

export default getMessages;
