import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { authTokens } from "@workspace/ui/lib/auth"

export const API_BASE = "http://localhost:5103"

/** Resolve any image path (relative /uploads/... or absolute http) to a displayable src */
export function resolveImageSrc(path: string | null | undefined): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${API_BASE}${path}`
}

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

export function ImageUpload({ value, onChange, placeholder = "https://..." }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"url" | "file">("url")

  const handleFile = async (file: File) => {
    setError("")
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authTokens.getAccessToken()}` },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? "Upload failed")
      }
      const data = await res.json() as { url: string }
      // Store full absolute URL so images display everywhere without extra resolution
      onChange(`${API_BASE}${data.url}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const displaySrc = resolveImageSrc(value)

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-1">
        {(["url", "file"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {m === "url" ? "URL" : "Upload"}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-3 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          {uploading ? (
            <span className="text-xs text-muted-foreground">Uploading…</span>
          ) : (
            <>
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Drop image here or{" "}
                <span className="text-primary underline">browse</span>
              </span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Preview */}
      {displaySrc && (
        <div className="relative w-full overflow-hidden rounded-lg border border-border">
          <img
            src={displaySrc}
            alt="Preview"
            className="h-32 w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}
