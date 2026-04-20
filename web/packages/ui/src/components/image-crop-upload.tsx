import { useRef, useState, useCallback, useEffect } from "react"
import { Upload, X, ZoomIn, RotateCw, Check, Crop } from "lucide-react"
import { authTokens } from "@workspace/ui/lib/auth"
import { getCachedApiBase, resolveImageUrl } from "@workspace/ui/lib/api-config"

export { resolveImageUrl as resolveImageSrc }

// ─── Crop math ────────────────────────────────────────────────────────────────
interface CropState {
  x: number; y: number; zoom: number; rotation: number
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

async function cropImageToBlob(
  imageSrc: string,
  { x, y, zoom, rotation }: CropState,
  canvasSize: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = canvasSize
      canvas.height = canvasSize
      const ctx = canvas.getContext("2d")!

      ctx.save()
      ctx.translate(canvasSize / 2, canvasSize / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom, zoom)
      ctx.translate(-canvasSize / 2, -canvasSize / 2)

      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvasSize, canvasSize)

      const scale = Math.min(canvasSize / img.width, canvasSize / img.height) * zoom
      const drawW = img.width * scale
      const drawH = img.height * scale
      const drawX = (canvasSize - drawW) / 2 + x
      const drawY = (canvasSize - drawH) / 2 + y

      ctx.drawImage(img, drawX, drawY, drawW, drawH)
      ctx.restore()

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      }, "image/jpeg", 0.92)
    }
    img.onerror = () => reject(new Error("Image load failed"))
    img.src = imageSrc
  })
}

interface CropperModalProps {
  src: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function CropperModal({ src, onConfirm, onCancel }: CropperModalProps) {
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, zoom: 1, rotation: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, cx: 0, cy: 0 })
  const [processing, setProcessing] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const PREVIEW_SIZE = 400

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setDragStart({ mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y })
    e.preventDefault()
  }
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.mx
    const dy = e.clientY - dragStart.my
    setCrop((c) => ({
      ...c,
      x: clamp(dragStart.cx + dx, -PREVIEW_SIZE * c.zoom, PREVIEW_SIZE * c.zoom),
      y: clamp(dragStart.cy + dy, -PREVIEW_SIZE * c.zoom, PREVIEW_SIZE * c.zoom),
    }))
  }, [dragging, dragStart])
  const handleMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setCrop((c) => ({ ...c, zoom: clamp(c.zoom - e.deltaY * 0.001, 0.5, 4) }))
  }

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      const blob = await cropImageToBlob(src, crop, 800)
      onConfirm(blob)
    } catch {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Crop className="size-4 text-primary" />
            <span className="font-semibold text-sm">Crop & Adjust Image</span>
          </div>
          <button onClick={onCancel} className="rounded-md p-1 hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex justify-center p-5">
          <div
            ref={previewRef}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            className="relative overflow-hidden rounded-xl border-2 border-primary/40 cursor-grab active:cursor-grabbing select-none"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, background: "#111" }}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={src}
                alt="crop preview"
                draggable={false}
                style={{
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.zoom}) rotate(${crop.rotation}deg)`,
                  transformOrigin: "center",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: `${PREVIEW_SIZE / 3}px ${PREVIEW_SIZE / 3}px`,
            }} />
            <div className="absolute inset-0 pointer-events-none rounded-xl ring-4 ring-primary/30" />
          </div>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ZoomIn className="size-3" /> Zoom</span>
              <span>{(crop.zoom * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min="50" max="400" step="1" value={crop.zoom * 100}
              onChange={(e) => setCrop((c) => ({ ...c, zoom: Number(e.target.value) / 100 }))}
              className="w-full accent-primary" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><RotateCw className="size-3" /> Rotation</span>
              <span>{crop.rotation}°</span>
            </div>
            <input type="range" min="-180" max="180" step="1" value={crop.rotation}
              onChange={(e) => setCrop((c) => ({ ...c, rotation: Number(e.target.value) }))}
              className="w-full accent-primary" />
          </div>
          <div className="flex gap-2">
            {[-90, -45, 0, 45, 90].map((deg) => (
              <button key={deg} onClick={() => setCrop((c) => ({ ...c, rotation: deg }))}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                  crop.rotation === deg ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                }`}>
                {deg}°
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setCrop({ x: 0, y: 0, zoom: 1, rotation: 0 })}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Reset
            </button>
            <button onClick={handleConfirm} disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {processing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing…
                </span>
              ) : <><Check className="size-4" />Use this image</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ImageCropUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

export function ImageCropUpload({ value, onChange, placeholder = "https://..." }: ImageCropUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<"url" | "file">("url")
  const [rawSrc, setRawSrc] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const openFilePicker = () => inputRef.current?.click()

  const handleFileSelected = (file: File) => {
    setError("")
    const objectUrl = URL.createObjectURL(file)
    setRawSrc(objectUrl)
    setShowCropper(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) handleFileSelected(file)
  }

  const handleCropConfirm = async (blob: Blob) => {
    setShowCropper(false)
    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.append("file", blob, "image.jpg")
      const res = await fetch(`${getCachedApiBase()}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authTokens.getAccessToken()}` },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message ?? "Upload failed")
      }
      const data = await res.json() as { url: string }
      onChange(`${getCachedApiBase()}${data.url}`)
      if (rawSrc) URL.revokeObjectURL(rawSrc)
      setRawSrc(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null)
  }

  const displaySrc = resolveImageUrl(value)

  return (
    <>
      {showCropper && rawSrc && (
        <CropperModal src={rawSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
      <div className="space-y-2">
        <div className="flex gap-1">
          {(["url", "file"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {m === "url" ? "URL" : "Upload & Crop"}
            </button>
          ))}
        </div>
        {mode === "url" ? (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40" />
        ) : (
          <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={openFilePicker}
            className="flex min-h-[90px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50">
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelected(file); e.target.value = "" }} />
            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading…
              </div>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-border bg-background">
                  <Upload className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <span className="text-xs font-medium text-foreground">Drop image here</span>
                  <span className="text-xs text-muted-foreground"> or </span>
                  <span className="text-xs font-medium text-primary underline">browse</span>
                </div>
                <p className="text-[10px] text-muted-foreground">You'll be able to crop & zoom before uploading</p>
              </>
            )}
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {displaySrc && (
          <div className="relative overflow-hidden rounded-lg border border-border">
            <img src={displaySrc} alt="Preview" className="h-36 w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-3 py-2">
              <span className="text-xs text-white/60 truncate max-w-[70%]">{value.split("/").pop()}</span>
              <div className="flex gap-1.5">
                {mode === "file" && (
                  <button type="button" onClick={openFilePicker}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-white/80 hover:bg-white/20 transition-colors">
                    <Crop className="size-3" /> Recrop
                  </button>
                )}
                <button type="button" onClick={() => onChange("")}
                  className="flex size-6 items-center justify-center rounded bg-white/10 text-white/70 hover:bg-red-500/60 hover:text-white transition-colors">
                  <X className="size-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export { ImageCropUpload as ImageUpload }
