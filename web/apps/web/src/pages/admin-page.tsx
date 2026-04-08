import { useState } from "react"
import { AdminSidebar } from "@workspace/ui/components/admin-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import CrudsManageUsers from "@workspace/ui/components/creative-tim/blocks/cruds-manage-users"
import CrudsManageNews from "@workspace/ui/components/creative-tim/blocks/cruds-manage-news"
import CrudsManageItems from "@workspace/ui/components/creative-tim/blocks/cruds-manage-items"
import CrudsManageEquipment from "@workspace/ui/components/creative-tim/blocks/cruds-manage-equipment"

type Section = "users" | "news" | "items" | "equipment"

export default function AdminPage() {
  const [section, setSection] = useState<Section>("users")

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AdminSidebar activeSection={section} onSectionChange={setSection} />
      <div className="fixed top-4 right-4 z-30">
        <SidebarTrigger className="rounded-full border border-white/15 bg-zinc-900/80 p-5 text-4xl text-white/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/30 hover:bg-zinc-800/90 hover:text-white hover:shadow-xl active:scale-95" />
      </div>
      <div className="to-white-900 h-full w-full flex-col bg-radial-[at_-500%_30%] from-purple-600 to-95% dark:bg-radial-[at_300%_30%] dark:to-85%">
        {section === "users" && <CrudsManageUsers />}
        {section === "news" && <CrudsManageNews />}
        {section === "items" && <CrudsManageItems />}
        {section === "equipment" && <CrudsManageEquipment />}
      </div>
    </SidebarProvider>
  )
}
