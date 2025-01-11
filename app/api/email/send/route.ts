import { sendEmail } from "@/actions/sendEmails";

export const POST = async (request: Request) => {
  const { name, email, to, cc, bcc, subject, htmlContent, accessToken } =
    await request.json();
  console.log("🚀 ~ POST ~ accessToken:", accessToken);
  console.log("🚀 ~ POST ~ to:", to);

  if (!to || !subject || !htmlContent || !accessToken) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  try {
    const result = await sendEmail({
      name,
      email,
      to,
      cc,
      bcc,
      subject,
      htmlContent,
      accessToken,
    });
    console.log("🚀 ~ POST ~ result:", result);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Failed to create a new quote", { status: 500 });
  }
};
