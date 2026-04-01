import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../card"
import { Badge } from "../../badge"
import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { Calendar } from "lucide-react"

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

export default function BlogContent() {
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

  console.log(posts)
  return (
    <section className="py-16">
      <div className="container mx-auto grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(({ imagePath, title, content, createdAt }) => (
          <Drawer direction="bottom">
            <DrawerTrigger>
              <Card key={title} className="overflow-hidden py-0">
                <CardHeader className="p-4 pb-0">
                  <div className="relative h-60 w-full overflow-hidden rounded-lg">
                    <img
                      src={imagePath}
                      alt={title}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  <CardTitle className="mb-2 text-xl">{title}</CardTitle>
                </CardContent>
                <CardFooter className="flex items-center gap-3 p-6 pt-0">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      {new Date(createdAt).toLocaleString()}
                    </p>
                  </div>
                </CardFooter>
              </Card>
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

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                            {content}
                          </p>
                        </div>
                        <DrawerClose
                          className="bg-neutral-900 text-base transition-all hover:bg-neutral-800"
                          asChild
                        >
                          <Button variant={"outline"}>Cancel</Button>
                        </DrawerClose>
                      </div>

                      <div className="relative h-[500px] lg:h-[700px]">
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          <img
                            src={imagePath}
                            alt="Modern architecture"
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
    </section>
  )
}
