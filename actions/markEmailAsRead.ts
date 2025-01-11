export default async function markEmailAsRead(
  messageId: string,
  accessToken: string
) {
  try {
    const response = await fetch("/api/email/markEmailAsRead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId, accessToken }),
    });
    console.log("🚀 ~ response:", response);
    console.log(`Email ${messageId} marked as read.`);
  } catch (error) {
    console.error("Failed to mark email as read:", error);
  }
}
