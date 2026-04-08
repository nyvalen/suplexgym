import * as React from "react"
import {
  Dumbbell,
  Users,
  Newspaper,
  Package,
  Dumbbell as GymIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar"
import { ModeToggle } from "./mode-toggle"
import { Language } from "./language"
import { Logout } from "./logout"

type Section = "users" | "news" | "items" | "equipment"

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: Section
  onSectionChange?: (section: Section) => void
}

export function AdminSidebar({
  activeSection = "users",
  onSectionChange,
  ...props
}: AdminSidebarProps) {
  const { t } = useTranslation()

  const navItems: { title: string; section: Section; icon: React.ReactNode }[] = [
    {
      title: t("admin.sections.users"),
      section: "users",
      icon: <Users className="size-4" />,
    },
    {
      title: t("admin.sections.news"),
      section: "news",
      icon: <Newspaper className="size-4" />,
    },
    {
      title: t("admin.sections.items"),
      section: "items",
      icon: <Package className="size-4" />,
    },
    {
      title: t("admin.sections.equipment"),
      section: "equipment",
      icon: <GymIcon className="size-4" />,
    },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant="outline" asChild>
              <a onClick={() => (window.location.href = "/")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-purple-600/60 text-sidebar-primary-foreground dark:bg-sidebar-ring">
                  <Dumbbell className="size-4" />
                </div>
                <div className="flex w-full gap-0.5 leading-none">
                  <span className="font-stretch-150 font-mono% size-6 tracking-widest text-sidebar-accent-foreground uppercase">
                    Suplex Gym
                  </span>
                </div>
                <span className="w-32 self-end text-xs text-muted-foreground">
                  {t("admin.title")}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.section
              return (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => onSectionChange?.(item.section)}
                    className="cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
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
