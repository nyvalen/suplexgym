import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import BlogContentLimited from "@workspace/ui/components/creative-tim/blocks/blog-content-limited"
import Hero from "@workspace/ui/components/creative-tim/blocks/hero"
import Passes from "@workspace/ui/components/creative-tim/blocks/passes"
import Faq from "@workspace/ui/components/creative-tim/blocks/faq"

export default function Page() {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />
      {/* Sticky floating sidebar trigger */}
      <div className="fixed top-4 right-4 z-30">
        <SidebarTrigger className="rounded-full border border-white/15 bg-zinc-900/80 p-5 text-4xl text-white/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/30 hover:bg-zinc-800/90 hover:text-white hover:shadow-xl active:scale-95" />
      </div>

      <div className="bg-zinc-650 relative min-h-screen w-full">
        <Hero />
        <BlogContentLimited />
        <Passes />
        <Faq />
      </div>
    </SidebarProvider>
  )
}
