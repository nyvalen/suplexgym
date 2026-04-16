import { useEffect, useState } from "react"
import { fetchWithAuth } from "@workspace/ui/lib/auth"
import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import { Textarea } from "../../textarea"
import { Pencil, Trash2, Plus, X, Check } from "lucide-react"
import { ImageUpload } from "../../image-upload"

const API_BASE = "http://localhost:5103"

type NewsItem = {
  id: number
  title: string
  imagePath: string
  content: string
  createdAt: string
  isActive: boolean
}

type NewsForm = {
  title: string
  imagePath: string
  content: string
}

const EMPTY_FORM: NewsForm = { title: "", imagePath: "", content: "" }

async function fetchNews(): Promise<NewsItem[]> {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/news`, { method: "GET" })
    if (!res.ok) throw new Error(`Failed fetch news: ${res.status}`)
    return (await res.json()) as NewsItem[]
  } catch (err) {
    console.error("Error fetching news:", err)
    return []
  }
}

export default function CrudsManageNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [message, setMessage] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<NewsForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<NewsForm>(EMPTY_FORM)

  const load = async () => setNews(await fetchNews())

  useEffect(() => { load() }, [])

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 4000)
  }

  const resolveImagePath = (path: string) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${API_BASE}${path}`
  }

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.content.trim()) {
      flash("Title and content are required.")
      return
    }
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/news`, {
        method: "POST",
        body: JSON.stringify(createForm),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("News article created.")
      setCreateForm(EMPTY_FORM)
      setShowCreate(false)
      load()
    } catch {
      flash("Failed to create article.")
    }
  }

  // ── Edit ────────────────────────────────────────────────────────────────────
  const startEdit = (item: NewsItem) => {
    setEditingId(item.id)
    setEditForm({
      title: item.title,
      imagePath: resolveImagePath(item.imagePath),
      content: item.content,
    })
  }

  const handleUpdate = async (id: number) => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      flash("Title and content are required.")
      return
    }
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/news/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("News article updated.")
      setEditingId(null)
      load()
    } catch {
      flash("Failed to update article.")
    }
  }

  // ── Delete (soft) ────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this news article?")) return
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/news/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Article deleted.")
      load()
    } catch {
      flash("Failed to delete article.")
    }
  }

  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Manage News</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create, edit and delete articles.</p>
          </div>
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
            {showCreate ? "Cancel" : "New Article"}
          </Button>
        </div>

        {/* ── Create form ── */}
        {showCreate && (
          <div className="mb-6 space-y-3 rounded-lg border border-border p-4">
            <h4 className="font-medium">New Article</h4>
            <div className="space-y-1">
              <Label htmlFor="c-title">Title</Label>
              <Input
                id="c-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Article title"
              />
            </div>
            <div className="space-y-1">
              <Label>Cover Image</Label>
              <ImageUpload
                value={createForm.imagePath}
                onChange={(url) => setCreateForm((f) => ({ ...f, imagePath: url }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-content">Content</Label>
              <Textarea
                id="c-content"
                value={createForm.content}
                onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                rows={4}
                placeholder="Article body…"
              />
            </div>
            <Button onClick={handleCreate}>Publish</Button>
          </div>
        )}

        {/* ── Article list ── */}
        <div className="space-y-3">
          {news.length === 0 && (
            <p className="text-sm text-muted-foreground">No articles found.</p>
          )}
          {news.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Cover Image</Label>
                    <ImageUpload
                      value={editForm.imagePath}
                      onChange={(url) => setEditForm((f) => ({ ...f, imagePath: url }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Content</Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(item.id)}>
                      <Check className="size-3.5" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="size-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {item.imagePath && (
                      <img
                        src={resolveImagePath(item.imagePath)}
                        alt={item.title}
                        className="h-14 w-20 shrink-0 rounded object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{item.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="icon-sm" variant="outline" onClick={() => startEdit(item)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </Card>
    </section>
  )
}
