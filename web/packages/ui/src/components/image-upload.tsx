import { useRef, useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { authTokens } from "@workspace/ui/lib/auth"

const API_BASE = "http://localhost:5103"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

export function ImageUpload({ value, onChange, placeholder = "https://... or upload" }: ImageUploadProps) {
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
        throw new Error(err.message ?? "Upload failed")
      }
      const data = await res.json()
      onChange(`${API_BASE}${data.url}`)
    } catch (e: any) {
      setError(e.message ?? "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const preview = value && (value.startsWith("http") || value.startsWith("/"))

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
                Drop image here or <span className="text-primary underline">browse</span>
              </span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Preview */}
      {preview && (
        <div className="relative w-full overflow-hidden rounded-lg border border-border">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
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

      {!preview && value && (
        <div className="flex items-center gap-1.5 rounded border border-border px-2 py-1">
          <ImageIcon className="size-3 text-muted-foreground" />
          <span className="truncate text-xs text-muted-foreground">{value}</span>
        </div>
      )}
    </div>
  )
}
