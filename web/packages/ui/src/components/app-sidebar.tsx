import * as React from "react"
import { Dumbbell, Home, Newspaper, CreditCard, Phone } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./sidebar"
import { HoverExpand } from "./unlumen-ui/hover-expand"
import { ModeToggle } from "./mode-toggle"
import { Admin } from "./admin"
import { Language } from "./language"

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
  },
  {
    label: "Memberships",
    href: "/plans",
    icon: CreditCard,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Phone,
  },
]

const spotlightItems = [
  {
    label: "New summer classes",
    sublabel: "June 2025",
    description: "12 new group sessions added to the timetable",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=600&q=75",
  },
  {
    label: "Equipment upgrade",
    sublabel: "May 2025",
    description: "40 new machines installed across the main floor",
    image:
      "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&w=600&q=75",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar variant="inset" {...props}>
      {/* Logo */}
      <SidebarHeader className="pb-4">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-ring">
            <Dumbbell className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-sidebar-accent-foreground uppercase">
              Suplex Gym
            </span>
            <span className="text-[10px] text-sidebar-foreground/40">
              Since 2025
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary nav */}
        <SidebarGroup>
          <SidebarMenu className="gap-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = location.pathname === href
              return (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton asChild isActive={active}>
                    <Link to={href} className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 opacity-70" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 my-1 border-t border-current opacity-8" />

        {/* News spotlight */}
        <SidebarGroup>
          <p className="mb-2 px-2 font-mono text-[10px] tracking-widest text-sidebar-foreground/40 uppercase">
            Latest
          </p>
          <Link to="/news" className="block rounded-md">
            <HoverExpand
              items={spotlightItems}
              collapsedHeight={62}
              expandedHeight={180}
            />
          </Link>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer actions */}
      <SidebarFooter>
        <div className="flex items-center gap-1 self-center px-1">
          <ModeToggle />
          <Admin />
          <Language />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
