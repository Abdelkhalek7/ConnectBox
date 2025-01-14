"use client";

import { useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { AccountSwitcher } from "@/components/account-switcher";
import { MailDisplay } from "@/components/mail-display";
import { MailList } from "@/components/mail-list";
import { Nav } from "@/components/nav";
import { useMail } from "@/hooks/use-mail";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getLabelsAPI } from "@/apis/getlabelsAPI";
import { getEmailsAPI } from "@/apis/getMailsAPI";

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}
const variantdefault: Record<string, "default" | "ghost"> = {
  INBOX: "ghost",
  SPAM: "ghost",
  TRASH: "ghost",
  UNREAD: "ghost",
  STARRED: "ghost",
  IMPORTANT: "ghost",
  SENT: "ghost",
  DRAFT: "ghost",
  ALL: "ghost",
  CATEGORY_PERSONAL: "ghost",
  CATEGORY_SOCIAL: "ghost",
  CATEGORY_PROMOTIONS: "ghost",
  CATEGORY_UPDATES: "ghost",
  CATEGORY_FORUMS: "ghost",
};

export function Mail({
  accounts,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [variant, setVariant] = useState<Record<string, "default" | "ghost">>({
    ...variantdefault,
    INBOX: "default",
  });
  const [selectedCategory, setSelectedCategory] = useState("INBOX");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setVariant({ ...variantdefault, [category]: "default" });
  };
  const [mail] = useMail();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const { data: labelsCounts } = useQuery({
    queryKey: ["labelsCounts", session?.user.id],
    queryFn: () => getLabelsAPI(session!.accessToken!),
    enabled: !!session?.accessToken,
    staleTime: 1000 * 60 * 150,
  });

  const { data: mails } = useQuery({
    queryKey: ["emails", session?.user.id, selectedCategory],
    queryFn: () => getEmailsAPI(session!.accessToken!, selectedCategory),

    enabled: !!session?.accessToken,
    staleTime: 1000 * 60 * 100,
  });
  console.log("mails", mails);
  console.log("labelsCounts", labelsCounts);
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes,
          )}`;
        }}
        className="h-[90%] max-h-[800px] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true,
            )}`;
          }}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false,
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div
            className={cn("flex h-[52px] items-center justify-between px-2")}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
                toast({
                  title: `Theme changed to ${
                    theme === "light" ? "dark" : "light"
                  }`,
                  description: "Your preference has been saved.",
                });
              }}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={labelsCounts?.group1 || []}
            variant={variant}
            handleCategorySelect={handleCategorySelect}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={labelsCounts?.group2 || []}
            variant={variant}
            handleCategorySelect={handleCategorySelect}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={mails || []} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
              <MailList
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items={(mails || []).filter((item: any) => !item.read)}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <MailDisplay
            selectedCategory={selectedCategory}
            mail={
              (mails || []).find(
                (item: { id: string | null }) => item.id === mail.selected,
              ) || null
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
