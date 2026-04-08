import * as React from "react"
import { Dumbbell, Home, Newspaper } from "lucide-react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

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

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const location = useLocation()
  const isHome = location.pathname === "/"

  const goToSection = (sectionId: string) => {
    if (isHome) {
      scrollTo(sectionId)
    } else {
      window.location.href = `/#${sectionId}`
    }
  }

  const navItems = [
    { label: t("nav.home"), icon: Home, sectionId: "/" },
    { label: t("nav.news"), icon: Newspaper, sectionId: "/news" },
  ]

  // Spotlight items link to different sections of the main page
  const spotlightItems = [
    {
      label: t("sidebar.spotlight.passes.label"),
      sublabel: t("sidebar.spotlight.passes.sublabel"),
      description: t("sidebar.spotlight.passes.description"),
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&w=600&q=75",
      sectionId: "passes",
    },
    {
      label: t("sidebar.spotlight.news.label"),
      sublabel: t("sidebar.spotlight.news.sublabel"),
      description: t("sidebar.spotlight.news.description"),
      image:
        "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&w=600&q=75",
      sectionId: "news",
    },
    {
      label: t("sidebar.spotlight.faq.label"),
      sublabel: t("sidebar.spotlight.faq.sublabel"),
      description: t("sidebar.spotlight.faq.description"),
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=600&q=75",
      sectionId: "faq",
    },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="pb-4">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-md px-2 py-1 transition-colors hover:bg-sidebar-accent"
          onClick={() => goToSection("hero")}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/60 dark:bg-sidebar-ring">
            <Dumbbell className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-medium tracking-[0.18em] text-sidebar-accent-foreground uppercase">
              Suplex Gym
            </span>
            <span className="text-[10px] text-sidebar-foreground/40">
              {t("hero.est")}
            </span>
          </div>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-0.5">
            {navItems.map(({ label, icon: Icon, sectionId }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  onClick={() => (window.location.href = sectionId)}
                  className="flex cursor-pointer items-center gap-2.5"
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-70" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <div className="mx-3 my-1 border-t border-current opacity-[0.08]" />

        {/* Spotlight items — each clicks to its respective section */}
        <SidebarGroup>
          <p className="mb-2 px-2 font-mono text-[10px] tracking-widest text-sidebar-foreground/40 uppercase">
            {t("nav.latest")}
          </p>
          <div className="flex flex-col gap-0">
            {spotlightItems.map((item) => (
              <div
                key={item.sectionId}
                className="cursor-pointer rounded-md"
                onClick={() => goToSection(item.sectionId)}
              >
                <HoverExpand
                  items={[item]}
                  collapsedHeight={62}
                  expandedHeight={160}
                />
              </div>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="mb-6 flex items-center gap-1 self-center px-1">
          <ModeToggle />
          <Admin />
          <Language />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
