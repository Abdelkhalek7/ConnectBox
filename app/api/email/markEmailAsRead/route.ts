import "@/lib/patchBuffer";
import markEmailAsRead from "@/actions/markEmailAsRead";

export const POST = async (request: Request) => {
  const { messageId, accessToken } = await request.json();
  console.log("🚀 ~ POST ~ messageId:", messageId);

  try {
    await markEmailAsRead(messageId, accessToken);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Failed to update the email", { status: 500 });
  }
};
