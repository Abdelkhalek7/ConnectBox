import getMessages from "@/actions/getemails";
import { getEmailCountByCategory } from "@/actions/getlabels";
import { Mail } from "@/components/mail";
import { accounts } from "@/data/mail";
import { authOptions } from "@/lib/auth";
import { parseSender } from "@/lib/parseSender";
import { Mail as MailType } from "@/types";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function MailPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    redirect("/login");
  }
  const [labelsCounts, emails] = await Promise.all([
    getEmailCountByCategory(session.accessToken).then((counts) => ({
      group1: counts.group1.map((label) => ({
        ...label,
        unreadcount: label.unreadcount ?? false,
        variant: label.variant as "default" | "ghost",
      })),
      group2: counts.group2.map((label) => ({
        ...label,
        unreadcount: label.unreadcount ?? false,
        variant: label.variant as "default" | "ghost",
      })),
    })),
    getMessages(session.accessToken),
  ]);

  // Your existing code starts here
  const layout = [265, 440, 655]; // Default layout, since we can't use cookies on the server
  const defaultCollapsed = false; // Default value, since we can't use cookies on the server

  const emailsFormatted: MailType[] = emails.map((email) => ({
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
        mails={emailsFormatted}
        defaultLayout={layout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
        labelsCounts={labelsCounts}
      />
    </div>
  );
}
