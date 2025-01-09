import { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/profile/sidebar-nav";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings and preferences.",
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

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Manage your personal information and preferences.
              </p>
            </div>
            <Separator />
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}
