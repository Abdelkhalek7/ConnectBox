/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";

const labelsGroup1 = [
  {
    label: "INBOX",
    name: "INBOX",
    icon: undefined,
    variant: "default",
    count: 0,
    unreadcount: true,
  },
  {
    label: "SPAM",
    name: "SPAM",
    icon: undefined,
    variant: "ghost",
    count: 0,
  },
  {
    label: "TRASH",
    name: "TRASH",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: false,
  },
  {
    label: "UNREAD",
    name: "UNREAD",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: true,
  },
  {
    label: "STARRED",
    name: "STARRED",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: false,
  },
  {
    label: "IMPORTANT",
    name: "IMPORTANT",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: false,
  },
  {
    label: "SENT",
    name: "SENT",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: false,
  },
  {
    label: "DRAFT",
    name: "DRAFT",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: false,
  },
  {
    label: "ALL",
    name: "ALL",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: false,
  },
];
const labelsGroup2 = [
  {
    label: "PERSONAL",
    name: "CATEGORY_PERSONAL",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: true,
  },
  {
    label: "SOCIAL",
    name: "CATEGORY_SOCIAL",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: true,
  },
  {
    label: "PROMOTIONS",
    name: "CATEGORY_PROMOTIONS",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: true,
  },
  {
    label: "UPDATES",
    name: "CATEGORY_UPDATES",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: true,
  },
  {
    label: "FORUMS",
    name: "CATEGORY_FORUMS",
    icon: undefined,
    variant: "ghost",
    count: 0,
    unreadcount: true,
  },
];

export async function getEmailCountByCategory(access_token: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: access_token,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const allLabels = [...labelsGroup1, ...labelsGroup2];

    // Create an array of promises for each label
    const promises = allLabels.map(async (label) => {
      let totalCount = 0;
      let nextPageToken = undefined;

      do {
        // Fetch messages for the label with pagination
        const labelIds =
          label.name && label.name !== "ALL" ? [label.name] : undefined;
        //
        const messagesResponse: any = await gmail.users.messages.list({
          userId: "me",
          labelIds: labelIds,
          maxResults: 500,
          q: label.unreadcount ? "is:unread" : "",
          pageToken: nextPageToken, // Use the token from the previous response
        });

        totalCount += messagesResponse.data.resultSizeEstimate || 0;

        // Update the page token for the next iteration
        nextPageToken = messagesResponse.data.nextPageToken;
      } while (nextPageToken);
      label.count = totalCount;
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    return {
      group1: labelsGroup1,
      group2: labelsGroup2,
    };
  } catch (error) {
    console.error("Error fetching email counts by category:", error);
    throw error;
  }
}
