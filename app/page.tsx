import { Mail } from "@/components/mail";
// import { accounts } from "@/data/mail";
import { authOptions } from "@/lib/auth";
// import { Mail as MailType } from "@/types";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getLabelsAPI } from "@/apis/getlabelsAPI";
import { getEmailsAPI } from "@/apis/getMailsAPI";

export default async function MailPage() {
  const session = await getServerSession(authOptions);
  const queryClient = new QueryClient();
  if (!session || !session.accessToken) {
    redirect("/login");
  }

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["labelsCounts", session.user.id],
      queryFn: () => getLabelsAPI(session.accessToken as string),
    }),
    queryClient.prefetchQuery({
      queryKey: ["emails", session.user.id, "INBOX"],
      queryFn: () => getEmailsAPI(session.accessToken as string, "INBOX"),
    }),
  ]);
  const layout = [265, 440, 655];
  const defaultCollapsed = false;
  const dehydratedState = dehydrate(queryClient);
  return (
    <div className="!overflow-hidden   max-h-screen h-[91.5vh] ">
      <HydrationBoundary state={dehydratedState}>
        <Mail
          accounts={[]}
          defaultLayout={layout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </HydrationBoundary>
    </div>
  );
}
