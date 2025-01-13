import { getEmailCountByCategory } from "@/actions/getlabels";

export const POST = async (request: Request) => {
  const { accessToken } = await request.json();
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await getEmailCountByCategory(accessToken);
    return new Response(JSON.stringify({ ...result }), { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return new Response("Failed to getlabels", { status: 500 });
  }
};
