import { useState } from "react"
import { AdminSidebar } from "@workspace/ui/components/admin-sidebar"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
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
      <div className="to-white-900 h-full w-full flex-col bg-radial-[at_-500%_30%] from-purple-600 to-95% dark:bg-radial-[at_300%_30%] dark:to-85%">
        {section === "users" && <CrudsManageUsers />}
        {section === "news" && <CrudsManageNews />}
        {section === "items" && <CrudsManageItems />}
        {section === "equipment" && <CrudsManageEquipment />}
      </div>
    </SidebarProvider>
  )
}
