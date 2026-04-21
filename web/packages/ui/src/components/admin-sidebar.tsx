import * as React from "react"
import { Dumbbell, Users, Newspaper, Package, Dumbbell as GymIcon, Tag } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "./sidebar"
import { ModeToggle } from "./mode-toggle"
import { Language } from "./language"
import { Logout } from "./logout"

type Section = "users" | "news" | "items" | "equipment" | "deals"

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: Section
  onSectionChange?: (section: Section) => void
  userRole?: string
}

export function AdminSidebar({
  activeSection = "users",
  onSectionChange,
  userRole = "admin",
  ...props
}: AdminSidebarProps) {
  const { t } = useTranslation()
  const isAdmin = userRole === "admin"

  type NavItem = { title: string; section: Section; icon: React.ReactNode; adminOnly?: boolean }

  const allNavItems: NavItem[] = [
    { title: t("admin.sections.users"), section: "users", icon: <Users className="size-4" />, adminOnly: true },
    { title: t("admin.sections.news"), section: "news", icon: <Newspaper className="size-4" /> },
    { title: t("admin.sections.items"), section: "items", icon: <Package className="size-4" />, adminOnly: true },
    { title: t("admin.sections.equipment"), section: "equipment", icon: <GymIcon className="size-4" /> },
  ]

  const navItems = isAdmin ? allNavItems : allNavItems.filter((i) => !i.adminOnly)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant="outline" asChild>
              <a onClick={() => (window.location.href = "/")}>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600/70">
                            <Dumbbell className="h-3.5 w-3.5 text-white" />
                          </div>
                <div className="flex w-7/12 gap-0.5 leading-none">
                  <span className="text-[11px] leading-none font-semibold tracking-[0.2em] text-white/90 uppercase">
              Suplex Gym
            </span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs text-muted-foreground">{t("admin.title")}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {userRole}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.section}>
                <SidebarMenuButton
                  isActive={activeSection === item.section}
                  onClick={() => onSectionChange?.(item.section)}
                  className="cursor-pointer"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="mb-6 flex items-center gap-1 self-center px-1">
          <ModeToggle />
          <Logout />
          <Language />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
