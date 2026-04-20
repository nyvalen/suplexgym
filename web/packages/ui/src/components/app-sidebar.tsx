import * as React from "react"
import { Dumbbell, Home, Newspaper, Settings } from "lucide-react"
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
import { Admin } from "./admin"
import { IpSettingsDialog } from "./ip-settings-dialog"

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const location = useLocation()
  const isHome = location.pathname === "/"
  const [showIpSettings, setShowIpSettings] = React.useState(false)

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
      label: t("sidebar.spotlight.news.label"),
      sublabel: t("sidebar.spotlight.news.sublabel"),
      description: t("sidebar.spotlight.news.description"),
      image:
        "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&w=600&q=75",
      sectionId: "news",
    },
    {
      label: t("sidebar.spotlight.passes.label"),
      sublabel: t("sidebar.spotlight.passes.sublabel"),
      description: t("sidebar.spotlight.passes.description"),
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&w=600&q=75",
      sectionId: "passes",
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
                className="flex items-center gap-2.5 rounded-md px-3 py-3 transition-opacity hover:opacity-70"
                onClick={() => scrollTo("hero")}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600/70">
                  <Dumbbell className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] leading-none font-semibold tracking-[0.2em] text-white/90 uppercase">
                    Suplex Gym
                  </span>
                  <span className="text-[9px] tracking-[0.1em] text-white/35">
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
          <button
            type="button"
            onClick={() => setShowIpSettings(true)}
            className="rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="IP Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <Admin />
        </div>
      </SidebarFooter>
      <IpSettingsDialog open={showIpSettings} onClose={() => setShowIpSettings(false)} />
    </Sidebar>
  )
}
