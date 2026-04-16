import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { Calendar, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const API_BASE = "http://localhost:5103"

type NewsItem = {
  imagePath: string
  title: string
  content: string
  createdAt: string
}

function resolveImage(path: string): string {
  if (!path)
    return "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
  if (path.startsWith("http")) return path
  return `${API_BASE}${path}`
}

async function fetchNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/news`)
    if (!res.ok) throw new Error("Failed fetch")
    return (await res.json()) as NewsItem[]
  } catch (err) {
    console.error("Error fetching news:", err)
    return []
  }
}

export default function BlogContentLimited() {
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

  return (
    <section id="news" className="scroll-mt-6 px-4 py-8 md:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-medium text-black/80 dark:text-white">
          {t("news.heading")}
        </h2>
        <Link
          to="/news"
          className="flex items-center gap-1.5 text-sm text-black/50 transition-colors hover:text-white max-md:hidden dark:text-white/50"
        >
          {t("nav.allNews")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map(({ imagePath, title, content, createdAt }) => (
          <Drawer key={title} direction="bottom">
            <DrawerTrigger asChild>
              <div className="group cursor-pointer overflow-hidden rounded-xl border border-black/3 bg-black/5 transition-colors hover:bg-black/8 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={resolveImage(imagePath)}
                    alt={title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm leading-snug font-medium text-black/80 dark:text-white">
                    {title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/40">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <div className="no-scrollbar overflow-y-auto px-4">
                <section className="py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h1 className="text-4xl leading-tight font-bold [text-wrap:balance] md:text-5xl">
                            {title}
                          </h1>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                          {content}
                        </p>
                        <DrawerClose asChild>
                          <Button variant="outline">{t("news.close")}</Button>
                        </DrawerClose>
                      </div>
                      <div className="relative h-[500px] lg:h-[700px]">
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          <img
                            src={resolveImage(imagePath)}
                            alt={title}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="absolute right-6 bottom-6 left-6 w-1/4 rounded-xl bg-white/95 p-4 backdrop-blur-sm dark:bg-neutral-900/95">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("news.photoCredit")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </DrawerContent>
          </Drawer>
        ))}
      </div>

      <div className="mt-5 text-center md:hidden">
        <Link to="/news">
          <Button
            variant="outline"
            className="border-white/20 text-black/80 hover:bg-white/5 hover:text-white dark:text-white/70"
          >
            {t("nav.allNews")}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
