import { google } from "googleapis";
import fs from "fs";
import path from "path";

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
  // Gmail base64 uses url-safe chars
  const base64 = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const buffer = Buffer.from(base64, "base64");
  return buffer.toString("utf-8");
}

async function getMessages(
  access_token: string,
  category: string,
): Promise<MessageDto[]> {
  if (access_token === "mock-access-token") {
    try {
      const filePath = path.join(process.cwd(), "data", "output.json");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawMessages: any[] = JSON.parse(fileContent);

        // Filter messages by category/label
        const filtered = rawMessages.filter((msg) => {
          if (!category || category === "ALL") return true;
          if (category === "UNREAD") return msg.labelIds?.includes("UNREAD");
          return msg.labelIds?.includes(category);
        });

        // Limit results to 10
        const messagesSlice = filtered.slice(0, 10);

        const detailedMessages: MessageDto[] = await Promise.all(
          messagesSlice.map(async (message) => {
            const messageDto: MessageDto = {
              id: message.id!,
              threadId: message.threadId!,
              snippet: message.snippet!,
              labelIds: message.labelIds!,
              payload: message.payload || null,
            };

            // Extract headers like "Subject", "From", and "Date"
            if (messageDto.payload?.headers) {
              const headers = messageDto.payload.headers;
              messageDto.subject = headers.find((h) => h.name === "Subject")?.value;
              messageDto.from = headers.find((h) => h.name === "From")?.value;
              messageDto.date = headers.find((h) => h.name === "Date")?.value;
            }

            // Handle decoding the body
            if (messageDto.payload) {
              const { mimeType, parts } = messageDto.payload;

              if (mimeType === "text/html" && messageDto.payload.body?.data) {
                messageDto.decodedBody = await decodeBase64(messageDto.payload.body.data);
              }

              if (mimeType === "multipart/alternative") {
                for (const part of parts || []) {
                  if (part.body?.data) {
                    messageDto.decodedBody = await decodeBase64(part.body.data);
                  }
                }
              }

              if (
                mimeType === "multipart/mixed" &&
                parts &&
                parts[0]?.mimeType === "multipart/alternative"
              ) {
                for (const part of parts[0]?.parts || []) {
                  if (part.body?.data) {
                    messageDto.decodedBody = await decodeBase64(part.body.data);
                  }
                }
              }

              if (
                mimeType === "multipart/mixed" &&
                parts &&
                parts[0]?.mimeType === "text/html"
              ) {
                messageDto.decodedBody = await decodeBase64(parts[0]?.body?.data || "");
              }
            }
            return messageDto;
          })
        );
        return detailedMessages;
      }
      return [];
    } catch (err) {
      console.error("Error reading mock emails:", err);
      return [];
    }
  }

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
              (h) => h.name === "Subject",
            )?.value;
            messageDto.from = headers.find((h) => h.name === "From")?.value;
            messageDto.date = headers.find((h) => h.name === "Date")?.value;
          }

          // Handle different MIME types and decode the body if necessary
          if (messageDto.payload) {
            const { mimeType, parts } = messageDto.payload;

            if (mimeType === "text/html" && messageDto.payload.body.data) {
              const decodedBody = await decodeBase64(
                messageDto.payload.body.data,
              );
              messageDto.decodedBody = decodedBody;
            }

            if (mimeType === "multipart/alternative") {
              for (const part of parts || []) {
                if (part.body?.data) {
                  const decodedBody = await decodeBase64(part.body.data);
                  part.body.data = decodedBody;
                  messageDto.decodedBody = decodedBody;
                }
              }
            }

            if (
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
            }

            if (
              mimeType === "multipart/mixed" &&
              parts &&
              parts[0]?.mimeType === "text/html"
            ) {
              const decodedBody = await decodeBase64(
                parts[0]?.body?.data || "",
              );
              parts[0].body.data = decodedBody;
              messageDto.decodedBody = decodedBody;
            }
          }
          return messageDto;
        }),
      );

      return detailedMessages;
    }
    return [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

export default getMessages;
