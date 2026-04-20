"use client"

import { useEffect, useRef, useState } from "react"
import { Dumbbell } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@workspace/ui/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { Language } from "./language"

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function ScrollHeader() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 60)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-5 py-3 transition-all duration-300 ease-in-out",
        visible
          ? "translate-y-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-transparent opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      )}
    >
      {/* Brand */}
      <button
        type="button"
        className="flex items-center gap-2.5 rounded-md px-1 py-1 transition-opacity hover:opacity-70"
        onClick={() => scrollTo("hero")}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600/70">
          <Dumbbell className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[11px] leading-none font-semibold tracking-[0.2em] text-white/90 uppercase">
            Suplex Gym
          </span>
          <span className="text-[9px] tracking-[0.1em] text-white/35">
            {t("hero.est")}
          </span>
        </div>
      </button>

      {/* Right controls */}
      <div className="mr-12 flex items-center gap-0.5">
        <ModeToggle />
        <Language />
      </div>
    </header>
  )
}
