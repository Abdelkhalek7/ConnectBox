import { google } from "googleapis";
import fs from "fs";
import path from "path";

export default async function modifyEmailLabels({
  messageId,
  accessToken,
  addLabelIds = [],
  removeLabelIds = [],
}: {
  messageId: string;
  accessToken: string;
  addLabelIds?: string[];
  removeLabelIds?: string[];
}) {
  if (accessToken === "mock-access-token") {
    try {
      const filePath = path.join(process.cwd(), "data", "output.json");
      const filePath2 = path.join(process.cwd(), "data", "output2.json");

      const updateFile = (p: string) => {
        if (fs.existsSync(p)) {
          const fileContent = fs.readFileSync(p, "utf-8");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawMessages: any[] = JSON.parse(fileContent);
          const updatedMessages = rawMessages.map((msg) => {
            if (msg.id === messageId) {
              let labels = msg.labelIds || [];
              labels = [...labels, ...addLabelIds];
              labels = labels.filter((l: string) => !removeLabelIds.includes(l));
              return { ...msg, labelIds: Array.from(new Set(labels)) };
            }
            return msg;
          });
          fs.writeFileSync(p, JSON.stringify(updatedMessages, null, 2), "utf-8");
        }
      };

      updateFile(filePath);
      updateFile(filePath2);
      return { success: true };
    } catch (err) {
      console.error("Error updating mock labels:", err);
      throw err;
    }
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const result = await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });
    return result.data;
  } catch (error) {
    console.error("Error modifying email labels:", error);
    throw error;
  }
}
