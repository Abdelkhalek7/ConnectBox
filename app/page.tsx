// import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { Mail } from "@/components/mail";
import { accounts, mails } from "@/data/mail";
import { authOptions } from "@/lib/auth";

export default async function MailPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Your existing code starts here
  const layout = [265, 440, 655]; // Default layout, since we can't use cookies on the server
  const defaultCollapsed = false; // Default value, since we can't use cookies on the server

  //   const layout = cookies().get("react-resizable-panels:layout")
  //   const collapsed = cookies().get("react-resizable-panels:collapsed")

  //   const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  //   const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <div className="h-screen overflow-hidden">
      <Mail
        accounts={accounts}
        mails={mails}
        defaultLayout={layout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  );
}
