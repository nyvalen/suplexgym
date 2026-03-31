import { AdminSidebar } from "@workspace/ui/components/admin-sidebar"
import { Button } from "@workspace/ui/components/button"
import CrudsManageUsers from "@workspace/ui/components/creative-tim/blocks/cruds-manage-users"
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
        <CrudsManageUsers />
      </div>
    </SidebarProvider>
  )
}
