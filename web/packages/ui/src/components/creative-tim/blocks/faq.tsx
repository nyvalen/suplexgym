"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function Faq() {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState<number | null>(null)

  const items = t("faq.items", { returnObjects: true }) as Array<{
    q: string
    a: string
  }>

  return (
    <section id="faq" className="scroll-mt-6 px-4 pt-4 pb-16 md:px-6">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-lg font-medium text-black/80 md:text-xl dark:text-white">
          {t("faq.heading")}
        </h2>
        <span className="font-mono text-[11px] tracking-widest text-black/50 uppercase dark:text-white/50">
          FAQ
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-x-6">
        {items.map(({ q, a }, i) => {
          const isOpen = open === i
          return (
            <div
              key={q}
              className="overflow-hidden rounded-xl border border-black/5 transition-colors dark:border-white/[0.08]"
              style={{
                background: isOpen
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.03)",
              }}
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="text-sm leading-snug font-medium text-black/80 dark:text-white">
                  {q}
                </span>
                <span
                  className="mt-0.5 shrink-0 text-white/40 transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? "200px" : "0px",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p className="px-5 pb-5 text-sm leading-relaxed text-black/50 dark:text-white/50">
                  {a}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
