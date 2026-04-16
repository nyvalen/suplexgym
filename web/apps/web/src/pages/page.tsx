import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import BlogContentLimited from "@workspace/ui/components/creative-tim/blocks/blog-content-limited"
import Hero from "@workspace/ui/components/creative-tim/blocks/hero"
import Passes from "@workspace/ui/components/creative-tim/blocks/passes"
import Faq from "@workspace/ui/components/creative-tim/blocks/faq"
import Footer from "@workspace/ui/components/footer"
import { ScrollHeader } from "@workspace/ui/components/scroll-header"

export default function Page() {
  return (
    // defaultOpen={false} keeps the sidebar closed on first load
    <SidebarProvider
      defaultOpen={false}
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />

      {/* Scroll-triggered header */}
      <ScrollHeader />

      {/* Floating sidebar trigger */}
      <div className="fixed top-4 right-4 z-30">
        <SidebarTrigger className="scale-90 rounded-full border border-white/15 bg-zinc-900/80 p-5 text-4xl text-white/80 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/30 hover:bg-zinc-800/90 hover:text-white hover:shadow-xl active:scale-85" />
      </div>

      <div className="bg-zinc-650 relative min-h-screen w-full">
        <Hero />
        <BlogContentLimited />
        <Passes />
        <Faq />
        <Footer />
      </div>
    </SidebarProvider>
  )
}
