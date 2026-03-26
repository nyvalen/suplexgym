import { AdminSidebar } from "@workspace/ui/components/admin-sidebar"
import { Button } from "@workspace/ui/components/button"
import CrudsGetUsers from "@workspace/ui/components/creative-tim/blocks/cruds-get-users"
import CrudsUpdateUser from "@workspace/ui/components/creative-tim/blocks/cruds-update-user"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

export default function AdminPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <div className="h-full w-full flex-col bg-radial-[at_1000%_30%] from-purple-600 to-zinc-900 to-95%">
        <CrudsGetUsers />
        <CrudsUpdateUser />
      </div>
    </SidebarProvider>
  )
}
