import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        bio: true,
        language: true,
        theme: true,
        notifications: true,
        emailDensity: true,
        conversationView: true,
        textDirection: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("GET profile error:", error);
    return new Response("Failed to fetch profile", { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const {
      name,
      bio,
      language,
      theme,
      notifications,
      emailDensity,
      conversationView,
      textDirection,
    } = await request.json();

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        bio: bio !== undefined ? bio : undefined,
        language: language !== undefined ? language : undefined,
        theme: theme !== undefined ? theme : undefined,
        notifications: notifications !== undefined ? notifications : undefined,
        emailDensity: emailDensity !== undefined ? emailDensity : undefined,
        conversationView: conversationView !== undefined ? conversationView : undefined,
        textDirection: textDirection !== undefined ? textDirection : undefined,
      },
    });

    return new Response(JSON.stringify({ success: true, user: updatedUser }), { status: 200 });
  } catch (error) {
    console.error("POST profile error:", error);
    return new Response("Failed to update profile", { status: 500 });
  }
};
