import { Metadata } from "next";
import { DisplayForm } from "@/components/profile/display-form";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/profile/sidebar-nav";

export const metadata: Metadata = {
  title: "Display Settings",
  description: "Manage your display preferences for the mail application.",
};

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/profile",
  },
  {
    title: "Account",
    href: "/profile/account",
  },
  {
    title: "Appearance",
    href: "/profile/appearance",
  },
  {
    title: "Notifications",
    href: "/profile/notifications",
  },
  {
    title: "Display",
    href: "/profile/display",
  },
];

export default function DisplayPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Display Settings</h1>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Display</h3>
              <p className="text-sm text-muted-foreground">
                Manage your display preferences for the mail application.
              </p>
            </div>
            <Separator />
            <DisplayForm />
          </div>
        </div>
      </div>
    </div>
  );
}
