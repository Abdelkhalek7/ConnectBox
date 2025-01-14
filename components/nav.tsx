import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  AlertOctagon,
  Trash2,
  Mail as MailIcon,
  Star,
  AlertCircle,
  Send,
  File,
  User,
  Users,
  Tag,
  Bell,
  MessageSquare,
  SaveAll,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavProps {
  isCollapsed: boolean;
  variant: Record<string, "default" | "ghost">;
  handleCategorySelect: (category: string) => void;
  links: {
    label: string;
    name: string;
    icon: LucideIcon | undefined;
    variant: "default" | "ghost";
    count: number;
    unreadcount: boolean;
  }[];
}

const labels = [
  { name: "INBOX", icon: Inbox },
  { name: "SPAM", icon: AlertOctagon },
  { name: "TRASH", icon: Trash2 },
  { name: "UNREAD", icon: MailIcon },
  { name: "STARRED", icon: Star },
  { name: "IMPORTANT", icon: AlertCircle },
  { name: "SENT", icon: Send },
  { name: "DRAFT", icon: File },
  { name: "ALL", icon: SaveAll },
  { name: "CATEGORY_PERSONAL", icon: User },
  { name: "CATEGORY_SOCIAL", icon: Users },
  { name: "CATEGORY_PROMOTIONS", icon: Tag },
  { name: "CATEGORY_UPDATES", icon: Bell },
  { name: "CATEGORY_FORUMS", icon: MessageSquare },
];

export function Nav({
  links,
  isCollapsed,
  variant,
  handleCategorySelect,
}: NavProps) {
  const [updatedLinks, setUpdatedLinks] = useState(links);

  useEffect(() => {
    // Map through links and assign icons where available

    // handleVariant("INBOX", "default");
    const newLinks = links.map((link) => {
      const foundLabel = labels.find((item) => item.name === link.name);
      return {
        ...link,
        icon: foundLabel?.icon || link.icon,
      };
    });
    setUpdatedLinks(newLinks);
  }, [links]);

  const handleClick = (name: string) => {
    handleCategorySelect(name);
  };
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {updatedLinks.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  onClick={() => {
                    handleClick(link.name);
                  }}
                  href="#"
                  className={cn(
                    buttonVariants({
                      variant:
                        (variant[link.name] as "default" | "ghost") || "ghost",
                      size: "icon",
                    }),
                    "h-9 w-9",
                    variant[link.name] === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                  )}
                >
                  {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.label}
                {link.count > 0 && (
                  <span className="ml-auto text-muted-foreground">
                    {link.count}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              onClick={() => handleClick(link.name)}
              key={index}
              href="#"
              className={cn(
                buttonVariants({
                  variant:
                    (variant[link.name] as "default" | "ghost") || "ghost",
                  size: "sm",
                }),
                variant[link.name] === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start",
              )}
            >
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.label}
              {link.count > 0 && <span className="ml-auto">{link.count}</span>}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
