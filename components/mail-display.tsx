"use client";

import { addDays, addHours, format, nextSaturday } from "date-fns";
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import { Mail } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useMarkEmailAsRead } from "@/hooks/useMarkEmailAsRead";
import { useModifyEmailLabels } from "@/hooks/useModifyEmailLabels";
import { useToast } from "@/hooks/use-toast";

interface MailDisplayProps {
  mail: Mail | null;
  selectedCategory: string;
}

export function MailDisplay({ mail, selectedCategory }: MailDisplayProps) {
  const today = new Date();
  const { data: session, status } = useSession();
  const markEmailAsRead = useMarkEmailAsRead();
  const modifyLabels = useModifyEmailLabels();
  const { toast } = useToast();
  const hasMarkedAsRead = useRef<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [muteOnSend, setMuteOnSend] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const markAsRead = async () => {
      if (
        session &&
        status === "authenticated" &&
        session.accessToken &&
        mail &&
        mail.labels?.includes("UNREAD") &&
        !hasMarkedAsRead.current.includes(mail.id)
      ) {
        console.log("Marking as read", mail.id);
        hasMarkedAsRead.current.push(mail.id);
        await markEmailAsRead.mutate({
          messageId: mail.id,
          session,
          selectedCategory,
        });
      }
    };

    markAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session,
    status,
    mail,
    selectedCategory,
  ]);

  const handleArchive = () => {
    if (!mail || !session) return;
    modifyLabels.mutate({
      messageId: mail.id,
      session,
      selectedCategory,
      removeLabelIds: ["INBOX"],
    });
    toast({
      title: "Thread archived",
      description: "Successfully archived the conversation.",
    });
  };

  const handleJunk = () => {
    if (!mail || !session) return;
    modifyLabels.mutate({
      messageId: mail.id,
      session,
      selectedCategory,
      addLabelIds: ["SPAM"],
      removeLabelIds: ["INBOX"],
    });
    toast({
      title: "Moved to spam",
      description: "Successfully marked the conversation as spam.",
    });
  };

  const handleTrash = () => {
    if (!mail || !session) return;
    modifyLabels.mutate({
      messageId: mail.id,
      session,
      selectedCategory,
      addLabelIds: ["TRASH"],
      removeLabelIds: ["INBOX"],
    });
    toast({
      title: "Moved to trash",
      description: "Successfully moved the conversation to trash.",
    });
  };

  const handleStar = () => {
    if (!mail || !session) return;
    const isStarred = mail.labels?.includes("STARRED");
    modifyLabels.mutate({
      messageId: mail.id,
      session,
      selectedCategory,
      addLabelIds: isStarred ? [] : ["STARRED"],
      removeLabelIds: isStarred ? ["STARRED"] : [],
    });
    toast({
      title: isStarred ? "Star removed" : "Starred conversation",
      description: isStarred ? "Removed star from thread." : "Added star to thread.",
    });
  };

  const handleUnread = () => {
    if (!mail || !session) return;
    modifyLabels.mutate({
      messageId: mail.id,
      session,
      selectedCategory,
      addLabelIds: ["UNREAD"],
    });
    toast({
      title: "Marked as unread",
      description: "Thread marked as unread.",
    });
  };

  const handleMute = () => {
    if (!mail || !session) return;
    modifyLabels.mutate({
      messageId: mail.id,
      session,
      selectedCategory,
      addLabelIds: ["MUTE"],
    });
    toast({
      title: "Muted conversation",
      description: "You will no longer receive notifications for this thread.",
    });
  };

  const handleSnooze = (timeDesc: string) => {
    if (!mail || !session) return;
    toast({
      title: "Conversation snoozed",
      description: `Snoozed until ${timeDesc}`,
    });
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mail || !session || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: session.user?.name || "User",
          email: session.user?.email || "user@connectbox.com",
          to: [mail.email],
          subject: mail.subject.toLowerCase().startsWith("re:")
            ? mail.subject
            : `Re: ${mail.subject}`,
          htmlContent: `<p>${replyText.replace(/\n/g, "<br>")}</p>`,
          accessToken: session.accessToken,
        }),
      });

      if (!response.ok) throw new Error("Failed to send reply");

      if (muteOnSend) {
        handleMute();
      }

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      });
      setReplyText("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const focusReply = () => {
    replyRef.current?.focus();
  };

  const prefillForward = () => {
    const forwardedText = `\n\n---------- Forwarded message ---------\nFrom: ${mail?.name} <${mail?.email}>\nDate: ${mail?.date}\nSubject: ${mail?.subject}\n\n`;
    setReplyText(forwardedText);
    focusReply();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} onClick={handleArchive}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} onClick={handleJunk}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} onClick={handleTrash}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mail}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze("Later today")}
                    >
                      Later today{" "}
                      <span className="ml-auto text-muted-foreground">
                        {format(addHours(today, 4), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze("Tomorrow")}
                    >
                      Tomorrow
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 1), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze("This weekend")}
                    >
                      This weekend
                      <span className="ml-auto text-muted-foreground">
                        {format(nextSaturday(today), "E, h:m b")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => handleSnooze("Next week")}
                    >
                      Next week
                      <span className="ml-auto text-muted-foreground">
                        {format(addDays(today, 7), "E, h:m b")}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} onClick={focusReply}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} onClick={focusReply}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} onClick={prefillForward}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleUnread}>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem onClick={handleStar}>
              {mail?.labels?.includes("STARRED") ? "Remove star" : "Star thread"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMute}>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    ?.split(" ")
                    .map((chunk) => chunk[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.date), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex-1 min-h-[300px]">
            <iframe
              srcDoc={mail.text || ""}
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
              style={{ backgroundColor: "white" }}
            ></iframe>
          </div>
          <Separator className="mt-auto" />
          <div className="p-4 bg-muted/40">
            <form onSubmit={handleSendReply}>
              <div className="grid gap-4">
                <Textarea
                  ref={replyRef}
                  className="p-4 bg-background resize-none"
                  placeholder={`Reply to ${mail.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none"
                  >
                    <Switch
                      id="mute"
                      aria-label="Mute thread"
                      checked={muteOnSend}
                      onCheckedChange={setMuteOnSend}
                    />{" "}
                    Mute thread on send
                  </Label>
                  <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700 text-white" disabled={isSendingReply || !replyText.trim()}>
                    {isSendingReply ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
