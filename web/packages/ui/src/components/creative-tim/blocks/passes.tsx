"use client"

import * as React from "react"
import { Check, Smartphone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { API_ENDPOINTS } from "@workspace/ui/lib/api-config"

const PASS_KEYS = ["napi", "havi", "szezonális", "éves"] as const
const FEATURED: (typeof PASS_KEYS)[number] = "szezonális"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiItem {
  id: number
  name: string | null
  price: number
  type_id: number
}

interface ApiDiscount {
  id: number
  itemId: number
  itemName: string | null
  originalPrice: number
  discountPercent: number
  discountedPrice: number
  validUntil: string | null
  createdAt: string
  isExpired: boolean
}

// Map type_id → pass card index  (1=daily, 2=monthly, 4=seasonal, 3=annual)
const TYPE_ID_TO_PASS_INDEX: Record<number, number> = {
  1: 0,
  2: 1,
  4: 2,
  3: 3,
}

function getTimeLeft(expiryDate: Date): string {
  const diff = expiryDate.getTime() - Date.now()
  if (diff <= 0) return ""
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h left`
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${mins}m left`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Passes() {
  const { t } = useTranslation()
  const [discountMap, setDiscountMap] = React.useState<
    Record<number, ApiDiscount>
  >({})
  const [apiItems, setApiItems] = React.useState<ApiItem[]>([])

  // Fetch active discounts from the real API endpoint
  const loadDiscounts = React.useCallback(() => {
    fetch(API_ENDPOINTS.items.replace("/api/items", "/api/discounts"))
      .then((r) => (r.ok ? r.json() : []))
      .then((discounts: ApiDiscount[]) => {
        const map: Record<number, ApiDiscount> = {}
        discounts
          .filter((d) => !d.isExpired)
          .forEach((d) => {
            map[d.itemId] = d
          })
        setDiscountMap(map)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    // Fetch items
    fetch(API_ENDPOINTS.items)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ApiItem[]) => setApiItems(data))
      .catch(() => {})

    loadDiscounts()

    // Re-poll every 60 s so expiring discounts vanish automatically
    const interval = setInterval(loadDiscounts, 60_000)
    return () => clearInterval(interval)
  }, [loadDiscounts])

  // Build passIndex → { itemId, discount? }
  const passDiscountInfo = React.useMemo(() => {
    const info: Record<number, { itemId: number; discount?: ApiDiscount }> = {}
    apiItems.forEach((item) => {
      const idx = TYPE_ID_TO_PASS_INDEX[item.type_id]
      if (idx !== undefined) {
        info[idx] = { itemId: item.id, discount: discountMap[item.id] }
      }
    })
    return info
  }, [apiItems, discountMap])

  const passes = [
    {
      key: "napi",
      name: t("passes.items.daily.name"),
      price: t("passes.items.daily.price"),
      unit: t("passes.items.daily.unit"),
      desc: t("passes.items.daily.desc"),
      features: t("passes.items.daily.features", {
        returnObjects: true,
      }) as string[],
      accentColor: "#f59e0b",
      label: "1 day",
      rawPrice: 2900,
    },
    {
      key: "havi",
      name: t("passes.items.monthly.name"),
      price: t("passes.items.monthly.price"),
      unit: t("passes.items.monthly.unit"),
      desc: t("passes.items.monthly.desc"),
      features: t("passes.items.monthly.features", {
        returnObjects: true,
      }) as string[],
      accentColor: "#10b981",
      label: "30 days",
      rawPrice: 12900,
    },
    {
      key: "szezonális",
      name: t("passes.items.threemonths.name"),
      price: t("passes.items.threemonths.price"),
      unit: t("passes.items.threemonths.unit"),
      desc: t("passes.items.threemonths.desc"),
      features: t("passes.items.threemonths.features", {
        returnObjects: true,
      }) as string[],
      accentColor: "#7c3aed",
      label: "90 days",
      rawPrice: 32900,
    },
    {
      key: "éves",
      name: t("passes.items.annual.name"),
      price: t("passes.items.annual.price"),
      unit: t("passes.items.annual.unit"),
      desc: t("passes.items.annual.desc"),
      features: t("passes.items.annual.features", {
        returnObjects: true,
      }) as string[],
      accentColor: "#6366f1",
      label: "365 days",
      rawPrice: 99900,
    },
  ]

  return (
    <section id="passes" className="scroll-mt-6 px-4 pt-4 pb-10 md:px-6">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-medium text-black/80 dark:text-white">
            {t("passes.heading")}
          </h2>
          <p className="mt-1 text-sm text-white/40">{t("passes.sub")}</p>
        </div>
        <span className="font-mono text-[11px] tracking-widest text-black/50 transition-colors dark:text-white/50">
          HUF
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {passes.map((pass, idx) => {
          const isFeatured = pass.key === FEATURED
          const discountInfo = passDiscountInfo[idx]
          const discount = discountInfo?.discount
          const hasDiscount = !!discount

          const timeLeft =
            hasDiscount && discount.validUntil
              ? getTimeLeft(new Date(discount.validUntil))
              : null

          return (
            <div
              key={pass.key}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-black/3 p-6 transition-colors hover:bg-black/6 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.05]"
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 right-0 left-0 h-[2.5px]"
                style={{
                  backgroundColor: isFeatured
                    ? pass.accentColor
                    : `${pass.accentColor}55`,
                }}
              />

              {/* Featured badge */}
              {isFeatured && (
                <span className="mb-3 inline-block w-fit rounded-full border border-black/5 bg-black/4 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-black/30 uppercase dark:border-white/20 dark:bg-white/10 dark:text-white/70">
                  {t("passes.popular")}
                </span>
              )}

              {/* Duration + SALE badges */}
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    backgroundColor: `${pass.accentColor}22`,
                    color: pass.accentColor,
                    border: `1px solid ${pass.accentColor}44`,
                  }}
                >
                  {pass.label}
                </span>

                {hasDiscount && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    -{discount.discountPercent}%
                  </span>
                )}
              </div>

              {/* Name + price */}
              <div className="mb-4">
                <p className="mb-0.5 text-xs font-medium tracking-wide text-black/50 uppercase dark:text-white/50">
                  {pass.name}
                </p>

                {hasDiscount ? (
                  <div>
                    {/* Discounted price (prominent) */}
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="text-3xl font-medium"
                        style={{ color: pass.accentColor }}
                      >
                        {discount.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-black/60 dark:text-white/40">
                        Ft{pass.unit}
                      </span>
                    </div>
                    {/* Original price struck through + saving */}
                    <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm line-through text-black/30 dark:text-white/30">
                        {discount.originalPrice.toLocaleString()} Ft
                      </span>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        Save{" "}
                        {(
                          discount.originalPrice - discount.discountedPrice
                        ).toLocaleString()}{" "}
                        Ft
                      </span>
                    </div>
                    {/* Expiry countdown */}
                    {timeLeft && (
                      <p className="mt-1 text-[10px] font-semibold text-red-500 dark:text-red-400">
                        ⏰ Sale ends in {timeLeft}
                      </p>
                    )}
                    {discount.validUntil && !timeLeft && (
                      <p className="mt-1 text-[10px] text-black/30 dark:text-white/30">
                        Sale ended
                      </p>
                    )}
                    {!discount.validUntil && (
                      <p className="mt-1 text-[10px] text-black/30 dark:text-white/30">
                        Indefinite offer
                      </p>
                    )}
                  </div>
                ) : (
                  /* Normal price */
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-medium text-black/80 dark:text-white">
                      {pass.price}
                    </span>
                    <span className="text-xs text-black/60 dark:text-white/40">
                      Ft{pass.unit}
                    </span>
                  </div>
                )}
              </div>

              <p className="mb-5 text-sm leading-relaxed text-black/50 dark:text-white/50">
                {pass.desc}
              </p>

              <ul className="mb-6 flex flex-col gap-2">
                {pass.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-black/30 dark:text-white/70"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black/60 dark:text-white/40" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Mobile-only CTA */}
              <div className="mt-auto">
                <div
                  className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5"
                  style={{
                    backgroundColor: `${pass.accentColor}11`,
                    borderColor: `${pass.accentColor}33`,
                    color: pass.accentColor,
                  }}
                >
                  <Smartphone className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-semibold">
                    {t("passes.mobileOnly")}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile app note */}
      <div className="mt-4 flex items-center justify-center gap-2.5 rounded-xl border border-black/5 bg-black/3 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <Smartphone className="h-4 w-4 shrink-0 text-black/40 dark:text-white/40" />
        <p className="text-center text-sm text-black/50 dark:text-white/40">
          {t("passes.mobileNote")}
        </p>
      </div>
    </section>
  )
}
