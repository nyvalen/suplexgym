import * as React from "react"
import {
  Dumbbell,
  Users,
  Newspaper,
  Package,
  Dumbbell as GymIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
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

const navItems: { title: string; section: Section; icon: React.ReactNode }[] = [
  {
    title: "Manage Users",
    section: "users",
    icon: <Users className="size-4" />,
  },
  {
    title: "Manage News",
    section: "news",
    icon: <Newspaper className="size-4" />,
  },
  {
    title: "Manage Items",
    section: "items",
    icon: <Package className="size-4" />,
  },
  {
    title: "Manage Equipment",
    section: "equipment",
    icon: <GymIcon className="size-4" />,
  },
]

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: Section
  onSectionChange?: (section: Section) => void
}

export function AdminSidebar({
  activeSection = "users",
  onSectionChange,
  ...props
}: AdminSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant="outline" asChild>
              <a onClick={() => (window.location.href = "/")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-ring text-sidebar-primary-foreground">
                  <Dumbbell className="size-4" />
                </div>
                <div className="flex w-full gap-0.5 leading-none">
                  <span className="font-stretch-150 font-mono% size-6 tracking-widest text-sidebar-accent-foreground uppercase">
                    Suplex Gym
                  </span>
                </div>
                <span className="w-32 self-end text-xs text-muted-foreground">
                  Admin Panel
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

      <div className="aspect-square items-center justify-center self-center rounded-lg">
        <ModeToggle />
        <Logout />
        <Language />
      </div>
    </Sidebar>
  )
}
