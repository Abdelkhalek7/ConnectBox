// import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Mail } from "@/components/mail";
import { Mail as MailType } from "@/types";
import { accounts } from "@/data/mail";
import { authOptions } from "@/lib/auth";
import getMessages from "@/actions/getemails";
import { parseSender } from "@/lib/parseSender";
export default async function MailPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/login");
  }
  const emails = await getMessages(session.accessToken);
  // Your existing code starts here
  const layout = [265, 440, 655]; // Default layout, since we can't use cookies on the server
  const defaultCollapsed = false; // Default value, since we can't use cookies on the server

  //   const layout = cookies().get("react-resizable-panels:layout")
  //   const collapsed = cookies().get("react-resizable-panels:collapsed")

  //   const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  //   const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined
  const emailsFormated: MailType[] = emails.map((email) => ({
    id: email.id,
    name: parseSender(email.from!).name,
    email: parseSender(email.from!).email,
    subject: email.subject!,
    date: email.date!,
    text: email.decodedBody!,
    labels: email.labelIds!,
    read: !email.labelIds!.includes("UNREAD"),
    snippet: email.snippet!,
  }));
  return (
    <div className="!overflow-hidden   max-h-screen h-[91.5vh] ">
      <Mail
        accounts={accounts}
        mails={emailsFormated}
        defaultLayout={layout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  );
}
