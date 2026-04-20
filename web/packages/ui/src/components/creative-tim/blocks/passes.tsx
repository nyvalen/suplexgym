"use client"

import * as React from "react"
import { Check, Smartphone, GraduationCap, Users, Tag, Percent } from "lucide-react"
import { useTranslation } from "react-i18next"

const PASS_KEYS = ["daily", "monthly", "seasonal", "annual"] as const
const FEATURED: (typeof PASS_KEYS)[number] = "seasonal"

type TargetGroup = "all" | "student" | "senior" | "member"

type Deal = {
  id: number
  title: string
  description: string
  targetGroup: TargetGroup
  discountPercent: number
  isActive: boolean
  code?: string
  validUntil?: string
}

// Demo deals shown even without backend
const DEMO_DEALS: Deal[] = [
  {
    id: 1,
    title: "Student Discount",
    description: "20% off any pass or ticket with a valid student ID.",
    targetGroup: "student",
    discountPercent: 20,
    isActive: true,
    code: "STUDENT20",
  },
  {
    id: 2,
    title: "Senior Discount",
    description: "15% off any pass for members aged 65 and above.",
    targetGroup: "senior",
    discountPercent: 15,
    isActive: true,
    code: "SENIOR15",
  },
]

const TARGET_LABELS: Record<TargetGroup, string> = {
  all: "Everyone",
  student: "Students",
  senior: "Seniors 65+",
  member: "Members",
}

const TARGET_ICONS: Record<TargetGroup, React.ReactNode> = {
  all: <Users className="size-3.5" />,
  student: <GraduationCap className="size-3.5" />,
  senior: <Users className="size-3.5" />,
  member: <Tag className="size-3.5" />,
}

const TARGET_COLORS: Record<TargetGroup, { bg: string; text: string; border: string }> = {
  all: { bg: "rgba(124,58,237,0.1)", text: "#a78bfa", border: "rgba(124,58,237,0.25)" },
  student: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  senior: { bg: "rgba(245,158,11,0.1)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  member: { bg: "rgba(16,185,129,0.1)", text: "#34d399", border: "rgba(16,185,129,0.25)" },
}

export default function Passes() {
  const { t } = useTranslation()
  const [deals, setDeals] = React.useState<Deal[]>(DEMO_DEALS)

  React.useEffect(() => {
    // Try to fetch real deals from backend
    const base = `http://${window.location.hostname}:5103`
    fetch(`${base}/api/deals`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && Array.isArray(data) && data.length > 0) setDeals(data) })
      .catch(() => {}) // silently keep demo deals
  }, [])

  const activeDeals = deals.filter((d) => d.isActive)

  const passes = [
    {
      key: "daily",
      name: t("passes.items.daily.name"),
      price: t("passes.items.daily.price"),
      unit: t("passes.items.daily.unit"),
      desc: t("passes.items.daily.desc"),
      features: t("passes.items.daily.features", { returnObjects: true }) as string[],
      accentColor: "#f59e0b",
      label: "1 day",
    },
    {
      key: "monthly",
      name: t("passes.items.monthly.name"),
      price: t("passes.items.monthly.price"),
      unit: t("passes.items.monthly.unit"),
      desc: t("passes.items.monthly.desc"),
      features: t("passes.items.monthly.features", { returnObjects: true }) as string[],
      accentColor: "#10b981",
      label: "30 days",
    },
    {
      key: "seasonal",
      name: t("passes.items.threemonths.name"),
      price: t("passes.items.threemonths.price"),
      unit: t("passes.items.threemonths.unit"),
      desc: t("passes.items.threemonths.desc"),
      features: t("passes.items.threemonths.features", { returnObjects: true }) as string[],
      accentColor: "#7c3aed",
      label: "90 days",
    },
    {
      key: "annual",
      name: t("passes.items.annual.name"),
      price: t("passes.items.annual.price"),
      unit: t("passes.items.annual.unit"),
      desc: t("passes.items.annual.desc"),
      features: t("passes.items.annual.features", { returnObjects: true }) as string[],
      accentColor: "#6366f1",
      label: "365 days",
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

      {/* Passes grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {passes.map((pass) => {
          const isFeatured = pass.key === FEATURED
          return (
            <div
              key={pass.key}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-black/3 p-6 transition-colors hover:bg-black/6 dark:bg-white/[0.04] dark:hover:bg-white/[0.05] dark:border-white/[0.08]"
            >
              <div
                className="absolute top-0 right-0 left-0 h-[2.5px]"
                style={{ backgroundColor: isFeatured ? pass.accentColor : `${pass.accentColor}55` }}
              />

              {isFeatured && (
                <span className="mb-3 inline-block w-fit rounded-full border border-black/5 bg-black/4 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-black/30 uppercase dark:border-white/20 dark:bg-white/10 dark:text-white/70">
                  {t("passes.popular")}
                </span>
              )}

              <div className="mb-3 flex items-center gap-2">
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
              </div>

              <div className="mb-4">
                <p className="mb-0.5 text-xs font-medium tracking-wide text-black/50 uppercase dark:text-white/50">
                  {pass.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-medium text-black/80 dark:text-white">
                    {pass.price}
                  </span>
                  <span className="text-xs text-black/60 dark:text-white/40">
                    Ft{pass.unit}
                  </span>
                </div>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-black/50 dark:text-white/50">
                {pass.desc}
              </p>

              <ul className="mb-6 flex flex-col gap-2">
                {pass.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-black/30 dark:text-white/70">
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
                  <span className="text-xs font-semibold">{t("passes.mobileOnly")}</span>
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

      {/* Deals & Discounts section */}
      {activeDeals.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-base font-medium text-black/70 dark:text-white/80">
              Special Offers & Discounts
            </h3>
            <span className="font-mono text-[11px] tracking-widest text-black/40 dark:text-white/30 uppercase">
              {activeDeals.length} active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeDeals.map((deal) => {
              const colors = TARGET_COLORS[deal.targetGroup]
              return (
                <div
                  key={deal.id}
                  className="relative flex flex-col gap-3 rounded-2xl border p-5 overflow-hidden"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  }}
                >
                  {/* Big discount number as background */}
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[80px] font-black opacity-[0.07] leading-none select-none pointer-events-none"
                    style={{ color: colors.text }}
                  >
                    {deal.discountPercent}%
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg border"
                        style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                      >
                        {TARGET_ICONS[deal.targetGroup]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: colors.text }}>
                          {TARGET_LABELS[deal.targetGroup]}
                        </p>
                        <p className="text-[10px] text-black/40 dark:text-white/30 font-mono uppercase tracking-wider">
                          {deal.discountPercent}% off
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 border text-xs font-bold"
                      style={{ backgroundColor: `${colors.bg}`, borderColor: colors.border, color: colors.text }}
                    >
                      <Percent className="size-3" />
                      {deal.discountPercent}%
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-black/80 dark:text-white text-sm mb-0.5">{deal.title}</p>
                    <p className="text-xs leading-relaxed text-black/50 dark:text-white/50">{deal.description}</p>
                  </div>

                  {deal.code && (
                    <div className="flex items-center gap-2">
                      <Tag className="size-3 text-black/30 dark:text-white/30" />
                      <span className="font-mono text-xs text-black/50 dark:text-white/40">
                        Code: <span className="font-bold text-black/70 dark:text-white/70">{deal.code}</span>
                      </span>
                    </div>
                  )}

                  {deal.validUntil && (
                    <p className="text-[10px] text-black/30 dark:text-white/25">
                      Valid until {new Date(deal.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
