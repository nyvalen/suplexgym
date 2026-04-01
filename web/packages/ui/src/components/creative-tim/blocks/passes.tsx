"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "../../button"
import { useTranslation } from "react-i18next"

const PASS_KEYS = ["single", "tenPass", "monthly", "annual"] as const
const FEATURED: (typeof PASS_KEYS)[number] = "monthly"

const ACCENT: Record<(typeof PASS_KEYS)[number], string> = {
  single: "border-white/[0.08]",
  tenPass: "border-white/[0.08]",
  monthly: "border-white/30",
  annual: "border-white/[0.08]",
}

export default function Passes() {
  const { t } = useTranslation()

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
        {PASS_KEYS.map((key) => {
          const item = t(`passes.items.${key}`, { returnObjects: true }) as {
            name: string
            price: string
            unit: string
            desc: string
            features: string[]
          }
          const isFeatured = key === FEATURED

          return (
            <div
              key={key}
              className={`relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-black/3 p-6 transition-colors hover:bg-black/5 dark:bg-white/[0.04] dark:hover:bg-white/[0.07] ${ACCENT[key]}`}
            >
              {isFeatured && (
                <div className="absolute top-0 right-0 left-0 h-[2px] bg-black/8 dark:bg-white/40" />
              )}

              {isFeatured && (
                <span className="mb-3 inline-block w-fit rounded-full border border-black/5 bg-black/4 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-black/30 uppercase dark:border-white/20 dark:bg-white/10 dark:text-white/70">
                  {t("passes.popular")}
                </span>
              )}

              <div className="mb-4">
                <p className="mb-0.5 text-xs font-medium tracking-wide text-black/50 uppercase dark:text-white/50">
                  {item.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-medium text-black/80 dark:text-white">
                    {item.price}
                  </span>
                  <span className="text-xs text-black/60 dark:text-white/40">
                    Ft{item.unit}
                  </span>
                </div>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-black/50 dark:text-white/50">
                {item.desc}
              </p>

              <ul className="mb-6 flex flex-col gap-2">
                {item.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-black/30 dark:text-white/70"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-black/60 dark:text-white/40" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-2">
                <Button
                  size="sm"
                  className={
                    isFeatured
                      ? "border-0 bg-black/70 text-white/80 hover:bg-black/60 dark:bg-white dark:text-zinc-950 dark:hover:bg-white/90"
                      : "border-black/20 text-black/70 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                  }
                  variant={isFeatured ? "default" : "outline"}
                >
                  {t("passes.buyNow")}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
