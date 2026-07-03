import "@/lib/patchBuffer";
import modifyEmailLabels from "@/actions/modifyEmailLabels";

export const POST = async (request: Request) => {
  try {
    const { messageId, accessToken, addLabelIds, removeLabelIds } = await request.json();

    if (!messageId || !accessToken) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const result = await modifyEmailLabels({
      messageId,
      accessToken,
      addLabelIds: addLabelIds || [],
      removeLabelIds: removeLabelIds || [],
    });

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });
  } catch (error) {
    console.error("Modify email API error:", error);
    return new Response("Failed to modify email labels", { status: 500 });
  }
};
