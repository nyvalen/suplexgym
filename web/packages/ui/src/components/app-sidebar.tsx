import * as React from "react"
import { Dumbbell } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "./sidebar"
import { HoverExpand } from "./unlumen-ui/hover-expand"
import { ModeToggle } from "./mode-toggle"
import { Admin } from "./admin"
import { Language } from "./language"

// This is sample data.
const data = {
  navMain: [
    {
      title: "1",
      url: "#",
      items: [
        {
          subitem: [
            {
              label: "Kyoto",
              sublabel: "Japan",
              description: "Ancient temples hidden among bamboo groves",
              image: "/images/1.jpg",
            },
          ],
          title: "1",
          url: "#",
        },
        {
          subitem: [
            {
              label: "Bangladesh",
              sublabel: "India",
              description: "Ancient temples hidden among bamboo groves",
              image: "/images/4.jpg.webp",
            },
          ],
          title: "2",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant={"outline"} asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-ring text-sidebar-primary-foreground">
                  <Dumbbell className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-stretch-150 font-mono% size-6 tracking-widest text-sidebar-accent-foreground uppercase">
                    Suplex Gym
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items?.length ? (
                  <SidebarMenuSub className="mb-1.5 ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <div className="mt-0.5 mb-1.5 w-full border-t border-current opacity-15" />
                        <a href={item.url}>
                          <HoverExpand items={item.subitem} />
                        </a>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <div className="aspect-square items-center justify-center self-center rounded-lg">
        <ModeToggle />
        <Admin />
        <Language />
      </div>
    </Sidebar>
  )
}
