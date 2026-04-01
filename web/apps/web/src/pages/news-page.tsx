import { useEffect, useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { Button } from "@workspace/ui/components/button"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import { Calendar, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

type NewsItem = {
  imagePath: string
  title: string
  content: string
  createdAt: string
}

async function fetchNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("http://localhost:5103/api/news")
    if (!res.ok) throw new Error("Failed fetch")
    return (await res.json()) as NewsItem[]
  } catch (err) {
    console.error("Error fetching news:", err)
    return []
  }
}

function ArticleDrawer({
  post,
  closeLabel,
  photoCredit,
}: {
  post: NewsItem
  closeLabel: string
  photoCredit: string
}) {
  return (
    <div className="no-scrollbar overflow-y-auto px-4">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl leading-tight font-bold [text-wrap:balance] md:text-5xl">
                  {post.title}
                </h1>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{post.createdAt}</span>
                </div>
              </div>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {post.content}
              </p>
              <DrawerClose asChild>
                <Button variant="outline">{closeLabel}</Button>
              </DrawerClose>
            </div>
            <div className="relative h-[500px] lg:h-[700px]">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <img
                  src={post.imagePath}
                  alt={post.title}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              <div className="absolute right-6 bottom-6 left-6 w-1/4 rounded-xl bg-white/95 p-4 backdrop-blur-sm dark:bg-neutral-900/95">
                <p className="text-xs font-medium text-muted-foreground">
                  {photoCredit}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function NewsPage() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<NewsItem[]>([])

  useEffect(() => {
    let active = true
    fetchNews().then((items) => {
      if (active) setPosts(items)
    })
    return () => {
      active = false
    }
  }, [])

  const [featured, ...rest] = posts

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />

      {/* Sticky floating sidebar trigger */}
      <div className="fixed top-4 right-4 z-30">
        <SidebarTrigger className="rounded-full border border-white/15 bg-zinc-900/80 p-2 text-white/60 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/30 hover:bg-zinc-800/90 hover:text-white hover:shadow-xl active:scale-95" />
      </div>

      <div className="relative min-h-screen w-full bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
          {/* Header */}
          <div className="mb-10 flex items-start justify-between">
            <div>
              <Link
                to="/"
                className="mb-4 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
              >
                <ArrowLeft className="h-3 w-3" />
                {t("nav.backHome")}
              </Link>
              <h1 className="text-3xl font-medium text-white md:text-4xl">
                {t("news.pageTitle")}
              </h1>
              <p className="mt-1.5 text-sm text-white/40">
                {t("news.pageSub")}
              </p>
            </div>
            <span className="font-mono text-[11px] tracking-widest text-white/20 uppercase">
              {posts.length} {t("news.articles")}
            </span>
          </div>

          {/* Featured */}
          {featured && (
            <Drawer direction="bottom">
              <DrawerTrigger asChild>
                <div className="group mb-6 cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] transition-colors hover:border-white/15">
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
                    <div className="relative h-64 overflow-hidden md:h-80">
                      <img
                        src={featured.imagePath}
                        alt={featured.title}
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-zinc-950/60 md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent md:hidden" />
                    </div>
                    <div className="flex flex-col justify-end bg-zinc-900/60 p-7 md:bg-transparent md:p-8">
                      <span className="mb-3 inline-block w-fit rounded-full border border-white/15 px-3 py-0.5 font-mono text-[10px] tracking-widest text-white/50 uppercase">
                        {t("news.featured")}
                      </span>
                      <h2 className="mb-3 text-xl leading-snug font-medium text-white md:text-2xl">
                        {featured.title}
                      </h2>
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/50">
                        {featured.content}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-white/30">
                        <Calendar className="h-3 w-3" />
                        {featured.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
              </DrawerTrigger>
              <DrawerContent>
                <ArticleDrawer
                  post={featured}
                  closeLabel={t("news.close")}
                  photoCredit={t("news.photoCredit")}
                />
              </DrawerContent>
            </Drawer>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Drawer key={post.title} direction="bottom">
                  <DrawerTrigger asChild>
                    <div className="group cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] transition-colors hover:border-white/15">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={post.imagePath}
                          alt={post.title}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                      <div className="p-4">
                        <p className="mb-2 text-sm leading-snug font-medium text-white">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-white/35">
                          <Calendar className="h-3 w-3" />
                          {post.createdAt}
                        </div>
                      </div>
                    </div>
                  </DrawerTrigger>
                  <DrawerContent>
                    <ArticleDrawer
                      post={post}
                      closeLabel={t("news.close")}
                      photoCredit={t("news.photoCredit")}
                    />
                  </DrawerContent>
                </Drawer>
              ))}
            </div>
          )}

          {posts.length === 0 && (
            <div className="py-24 text-center text-sm text-white/30">
              {t("news.noArticles")}
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  )
}
