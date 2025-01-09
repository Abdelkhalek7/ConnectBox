import { Metadata } from "next"
import { NotificationsForm } from "@/components/profile/notifications-form"
import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/components/profile/sidebar-nav"

export const metadata: Metadata = {
  title: "Notification Settings",
  description: "Manage your notification preferences.",
}

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
]

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences.
              </p>
            </div>
            <Separator />
            <NotificationsForm />
          </div>
        </div>
      </div>
    </div>
  )
}

