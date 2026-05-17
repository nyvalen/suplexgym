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
import CrudsManageDiscounts from "@workspace/ui/components/creative-tim/blocks/cruds-manage-discounts"

type Section = "users" | "news" | "items" | "equipment" | "discounts"

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

  const defaultSection: Section = isAdmin ? "users" : "news"
  const [section, setSection] = useState<Section>(defaultSection)

  const handleSectionChange = (s: Section) => {
    if (!isAdmin && (s === "users" || s === "items" || s === "discounts")) return
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
        <SidebarTrigger className="rounded-full border border-border bg-background/80 p-5 text-4xl text-foreground/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-border hover:bg-background/90 hover:text-foreground hover:shadow-xl active:scale-95" />
      </div>
      <div className="min-h-screen w-full flex-col bg-background dark:bg-radial-[at_300%_30%] dark:from-purple-600 dark:to-85%">
        {section === "users" && isAdmin && <CrudsManageUsers />}
        {section === "news" && <CrudsManageNews />}
        {section === "items" && isAdmin && <CrudsManageItems />}
        {section === "equipment" && <CrudsManageEquipment />}
        {section === "discounts" && isAdmin && <CrudsManageDiscounts />}
      </div>
    </SidebarProvider>
  )
}
