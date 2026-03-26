import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import BlogContentLimited from "@workspace/ui/components/creative-tim/blocks/blog-content-limited"
import Hero from "@workspace/ui/components/creative-tim/blocks/hero"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <div className="h-full flex-col bg-radial-[at_1000%_30%] from-purple-600 to-zinc-900 to-95%">
        {" "}
        <Hero />
        <BlogContentLimited />
        <SidebarTrigger className="absolute top-0 right-0 ml-2 shrink-0 px-4" />
      </div>
    </SidebarProvider>
  )
}
