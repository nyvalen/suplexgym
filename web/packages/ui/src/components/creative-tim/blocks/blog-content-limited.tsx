import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../card"
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

export default function BlogContentLimited() {
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
    <section className="px-4 py-8 md:px-6">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-medium text-black/80 dark:text-white">
          Latest news
        </h2>
        <Link
          to="/news"
          className="flex items-center gap-1.5 text-sm text-black/50 transition-colors hover:text-white max-md:hidden dark:text-white/50"
        >
          All news
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map(({ imagePath, title, content, createdAt }) => (
          <Drawer key={title} direction="bottom">
            <DrawerTrigger asChild>
              <div className="group cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-white/4 transition-colors hover:bg-white/8">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={imagePath}
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
                          <h1 className="text-4xl leading-tight font-bold [text-wrap:balance] md:text-5xl lg:text-6xl">
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
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </div>
                      <div className="relative h-[500px] lg:h-[700px]">
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          <img
                            src={imagePath}
                            alt={title}
                            className="h-full w-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                        </div>
                        <div className="absolute right-6 bottom-6 left-6 w-1/4 rounded-xl bg-white/95 p-4 backdrop-blur-sm dark:bg-neutral-900/95">
                          <p className="text-xs font-medium text-muted-foreground">
                            Photo by Suplex Gym
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

      {/* Mobile view-all */}
      <div className="mt-5 text-center md:hidden">
        <Link to="/news">
          <Button
            variant="outline"
            className="border-white/20 text-black/80 hover:bg-white/5 hover:text-white dark:text-white/70"
          >
            View all news
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
