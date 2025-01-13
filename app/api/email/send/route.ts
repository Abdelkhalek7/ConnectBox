import { sendEmail } from "@/actions/sendEmails";

export const POST = async (request: Request) => {
  const { name, email, to, cc, bcc, subject, htmlContent, accessToken } =
    await request.json();

  if (!to || !subject || !htmlContent || !accessToken) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Failed to send the email", { status: 500 });
  }
};
