import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { fetchWithAuth } from "@workspace/ui/lib/auth"
import { API_ENDPOINTS, resolveImageUrl } from "@workspace/ui/lib/api-config"
import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "../../select"
import { Plus, X, Trash2, Tag, Clock, Percent, TrendingDown } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Item = {
  id: number
  name: string | null
  price: number
  validityDays: number
  typeName: string | null
  type_id: number
  imagePath?: string | null
}

// A discount lives only in the frontend store (localStorage) since the backend
// doesn't have a /api/discounts endpoint. The discounted price is pushed to the
// item's display price when active. On expiry the original price shows again.
type Discount = {
  id: string          // uuid generated client-side
  itemId: number
  itemName: string
  originalPrice: number
  discountPercent: number
  discountedPrice: number
  validUntil: string | null  // ISO date string or null = indefinite
  createdAt: string
}

const STORAGE_KEY = "suplex_discounts_v1"

function loadDiscounts(): Discount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Discount[]
  } catch {
    return []
  }
}

function saveDiscounts(discounts: Discount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(discounts))
}

function isDiscountActive(d: Discount): boolean {
  if (!d.validUntil) return true
  return new Date(d.validUntil) > new Date()
}

function calcDiscounted(originalPrice: number, pct: number): number {
  return Math.round(originalPrice * (1 - pct / 100))
}

function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CrudsManageDiscounts() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Item[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [message, setMessage] = useState("")

  // form state
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [discountPct, setDiscountPct] = useState<string>("20")
  const [validUntil, setValidUntil] = useState<string>("")

  // Load items from API
  useEffect(() => {
    fetchWithAuth(API_ENDPOINTS.items, { method: "GET" })
      .then(r => r.ok ? r.json() : [])
      .then((data: Item[]) => setItems(data))
      .catch(() => {})
  }, [])

  // Load discounts from localStorage
  useEffect(() => {
    setDiscounts(loadDiscounts())
  }, [])

  // Prune expired discounts every minute
  useEffect(() => {
    const prune = () => {
      const current = loadDiscounts()
      const active = current.filter(d => !d.validUntil || new Date(d.validUntil) > new Date())
      if (active.length !== current.length) {
        saveDiscounts(active)
        setDiscounts(active)
      }
    }
    prune()
    const interval = setInterval(prune, 60_000)
    return () => clearInterval(interval)
  }, [])

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 4000)
  }

  const selectedItem = items.find(i => String(i.id) === selectedItemId)
  const pctNum = Number(discountPct)
  const previewDiscounted = selectedItem ? calcDiscounted(selectedItem.price, pctNum) : 0
  const previewSaving = selectedItem ? selectedItem.price - previewDiscounted : 0

  const handleCreate = () => {
    if (!selectedItem) { flash(t("cruds.discounts.selectTicket")); return }
    if (!discountPct || isNaN(pctNum) || pctNum < 1 || pctNum > 99) {
      flash(t("cruds.discounts.discountPercent") + ": 1–99%")
      return
    }

    // Remove any existing discount for this item first
    const without = discounts.filter(d => d.itemId !== selectedItem.id)

    const newDiscount: Discount = {
      id: uuid(),
      itemId: selectedItem.id,
      itemName: selectedItem.name ?? "Ticket",
      originalPrice: selectedItem.price,
      discountPercent: pctNum,
      discountedPrice: calcDiscounted(selectedItem.price, pctNum),
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      createdAt: new Date().toISOString(),
    }

    const updated = [...without, newDiscount]
    saveDiscounts(updated)
    setDiscounts(updated)
    flash(t("cruds.discounts.created"))
    setShowCreate(false)
    setSelectedItemId("")
    setDiscountPct("20")
    setValidUntil("")
  }

  const handleDelete = (id: string) => {
    if (!confirm(t("cruds.discounts.confirmDelete"))) return
    const updated = discounts.filter(d => d.id !== id)
    saveDiscounts(updated)
    setDiscounts(updated)
    flash(t("cruds.discounts.deleted"))
  }

  // Items that don't currently have an active discount (for the create form)
  const availableItems = items.filter(
    i => !discounts.some(d => d.itemId === i.id && isDiscountActive(d))
  )

  const activeDiscounts = discounts.filter(isDiscountActive)
  const expiredDiscounts = discounts.filter(d => !isDiscountActive(d))

  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{t("cruds.discounts.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("cruds.discounts.description")}</p>
          </div>
          <Button onClick={() => setShowCreate(v => !v)} size="sm">
            {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
            {showCreate ? t("cruds.discounts.cancel") : t("cruds.discounts.newDiscount")}
          </Button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 space-y-4 rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingDown className="size-4 text-primary" />
              New Price Discount
            </div>

            {/* Ticket selector */}
            <div className="space-y-1.5">
              <Label>{t("cruds.discounts.selectTicket")}</Label>
              {availableItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("cruds.discounts.noTickets")}</p>
              ) : (
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("cruds.discounts.selectTicketPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableItems.map(item => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          <span className="flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.price.toLocaleString()} Ft
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Discount % */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Percent className="size-3.5" />
                {t("cruds.discounts.discountPercent")}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={discountPct}
                  onChange={e => setDiscountPct(e.target.value)}
                  placeholder="20"
                  className="w-28"
                />
                <input
                  type="range"
                  min={1}
                  max={99}
                  value={pctNum || 20}
                  onChange={e => setDiscountPct(e.target.value)}
                  className="flex-1 accent-primary"
                />
                <span className="w-12 text-right text-sm font-bold text-primary">{discountPct}%</span>
              </div>
            </div>

            {/* Valid until */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {t("cruds.discounts.validUntil")}
              </Label>
              <Input
                type="datetime-local"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">{t("cruds.discounts.validUntilNote")}</p>
            </div>

            {/* Price preview */}
            {selectedItem && !isNaN(pctNum) && pctNum > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Preview</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedItem.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-bold text-foreground">
                        {previewDiscounted.toLocaleString()} Ft
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {selectedItem.price.toLocaleString()} Ft
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                      -{pctNum}%
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Save {previewSaving.toLocaleString()} Ft
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreate}
              className="w-full"
              disabled={!selectedItem || isNaN(pctNum) || pctNum < 1}
            >
              <Tag className="size-4" />
              {t("cruds.discounts.save")}
            </Button>
          </div>
        )}

        {/* Active discounts */}
        <div className="space-y-3">
          {activeDiscounts.length === 0 && expiredDiscounts.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <TrendingDown className="mx-auto mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("cruds.discounts.noDiscounts")}</p>
            </div>
          )}

          {activeDiscounts.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("cruds.discounts.active")} ({activeDiscounts.length})
              </p>
              {activeDiscounts.map(discount => (
                <DiscountCard
                  key={discount.id}
                  discount={discount}
                  isActive={true}
                  onDelete={() => handleDelete(discount.id)}
                  t={t}
                />
              ))}
            </>
          )}

          {expiredDiscounts.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("cruds.discounts.expired")} ({expiredDiscounts.length})
              </p>
              {expiredDiscounts.map(discount => (
                <DiscountCard
                  key={discount.id}
                  discount={discount}
                  isActive={false}
                  onDelete={() => handleDelete(discount.id)}
                  t={t}
                />
              ))}
            </>
          )}
        </div>

        {message && (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        )}
      </Card>
    </section>
  )
}

// ─── Discount Card ────────────────────────────────────────────────────────────

function DiscountCard({
  discount,
  isActive,
  onDelete,
  t,
}: {
  discount: Discount
  isActive: boolean
  onDelete: () => void
  t: (key: string, opts?: Record<string, string | number>) => string
}) {
  const timeLeft = discount.validUntil
    ? getTimeLeft(new Date(discount.validUntil))
    : null

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
        isActive
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-muted/20 opacity-60"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {/* Discount badge */}
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            isActive
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              : "bg-muted text-muted-foreground"
          }`}>
            <Percent className="size-3" />
            {discount.discountPercent}% {t("cruds.discounts.off")}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isActive
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}>
            {isActive ? t("cruds.discounts.active") : t("cruds.discounts.expired")}
          </span>
        </div>

        <p className="font-semibold text-foreground">{discount.itemName}</p>

        {/* Price display */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {discount.discountedPrice.toLocaleString()} {t("cruds.discounts.huf")}
          </span>
          <span className="text-sm line-through text-muted-foreground">
            {discount.originalPrice.toLocaleString()} {t("cruds.discounts.huf")}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">
            -{(discount.originalPrice - discount.discountedPrice).toLocaleString()} Ft
          </span>
        </div>

        {/* Expiry info */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3 shrink-0" />
          {discount.validUntil ? (
            <span>
              {isActive && timeLeft
                ? `Expires in ${timeLeft}`
                : `Expired ${new Date(discount.validUntil).toLocaleDateString()}`}
            </span>
          ) : (
            <span>{t("cruds.discounts.indefinite")}</span>
          )}
        </div>
      </div>

      <Button
        size="icon-sm"
        variant="destructive"
        onClick={onDelete}
        title="Remove discount"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

function getTimeLeft(expiryDate: Date): string {
  const now = new Date()
  const diff = expiryDate.getTime() - now.getTime()
  if (diff <= 0) return "expired"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// ─── Export helper for other components to read active discounts ──────────────
export function getActiveDiscounts(): Discount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const all = JSON.parse(raw) as Discount[]
    return all.filter(d => !d.validUntil || new Date(d.validUntil) > new Date())
  } catch {
    return []
  }
}

export type { Discount }
