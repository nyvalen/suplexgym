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
import CrudsManageDeals from "@workspace/ui/components/creative-tim/blocks/cruds-manage-deals"

type Section = "users" | "news" | "items" | "equipment" | "deals"

function getUserRole(): string {
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) return ""
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role ?? ""
  } catch {
    return ""
  }
}

export default function AdminPage() {
  const role = getUserRole()
  const isAdmin = role === "admin"

  // Staff can only access news and equipment
  const defaultSection: Section = isAdmin ? "users" : "news"
  const [section, setSection] = useState<Section>(defaultSection)

  const handleSectionChange = (s: Section) => {
    // Block staff from user/item management
    if (!isAdmin && (s === "users" || s === "items")) return
    setSection(s)
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AdminSidebar
        activeSection={section}
        onSectionChange={handleSectionChange}
        userRole={role}
      />
      <div className="fixed top-4 right-4 z-30">
        <SidebarTrigger className="rounded-full border border-white/15 bg-zinc-900/80 p-5 text-4xl text-white/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/30 hover:bg-zinc-800/90 hover:text-white hover:shadow-xl active:scale-95" />
      </div>
      <div className="to-white-900 h-full w-full flex-col bg-radial-[at_-500%_30%] from-purple-600 to-95% dark:bg-radial-[at_300%_30%] dark:to-85%">
        {section === "users" && isAdmin && <CrudsManageUsers />}
        {section === "news" && <CrudsManageNews />}
        {section === "items" && isAdmin && <CrudsManageItems />}
        {section === "equipment" && <CrudsManageEquipment />}
        {section === "deals" && <CrudsManageDeals />}
      </div>
    </SidebarProvider>
  )
}
