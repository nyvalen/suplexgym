"use client"

import * as React from "react"
import { Server, X, Check, Wifi } from "lucide-react"
import {
  getCachedApiBase,
  setApiIp,
  getStoredApiIp,
  DEFAULT_PORT,
} from "../lib/api-config"

// Development mode flag - set to false to hide in production
const DEV_MODE = true

interface IpSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function IpSettingsDialog({ open, onClose }: IpSettingsDialogProps) {
  // ─── This component only exists in development ────────────────────────────────
  // It is never rendered in production builds if DEV_MODE is set to false.

  const [isDark, setIsDark] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Read theme from document root class
    const root = window.document.documentElement
    const hasDarkClass = root.classList.contains("dark")
    setIsDark(hasDarkClass)
    setMounted(true)

    // Listen for class changes
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"))
    })

    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const [ip, setIp] = React.useState("")
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setIp(getStoredApiIp())
      setSaved(false)
      setError("")
    }
  }, [open])

  // Dev mode guard - check AFTER all hooks
  if (!DEV_MODE || !mounted || !open) {
    return null
  }

  // Theme colors
  const colors = isDark
    ? {
        bg: "bg-zinc-900",
        border: "border-white/10",
        borderSubtle: "border-white/8",
        text: "text-white",
        textMuted: "text-white/50",
        textSubtle: "text-white/40",
        inputBg: "bg-white/5",
        inputBorder: "border-white/10",
        inputFocus: "focus:border-purple-500/50 focus:ring-purple-500/30",
        buttonHover: "hover:bg-white/8 hover:text-white",
        error: "text-red-400",
      }
    : {
        bg: "bg-white",
        border: "border-slate-200",
        borderSubtle: "border-slate-100",
        text: "text-slate-900",
        textMuted: "text-slate-600",
        textSubtle: "text-slate-500",
        inputBg: "bg-slate-50",
        inputBorder: "border-slate-200",
        inputFocus: "focus:border-purple-500 focus:ring-purple-400",
        buttonHover: "hover:bg-slate-100 hover:text-slate-900",
        error: "text-red-600",
      }

  const handleSave = () => {
    const trimmed = ip.trim()
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipv4.test(trimmed)) {
      setError("Enter a valid IPv4 address (e.g. 192.168.1.100)")
      return
    }
    setApiIp(trimmed)
    setSaved(true)
    setTimeout(() => {
      onClose()
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    }, 800)
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${isDark ? "bg-black/60" : "bg-black/40"} p-4 backdrop-blur-sm`}
    >
      <div
        className={`w-full max-w-sm rounded-2xl ${colors.border} border ${colors.bg} shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between rounded-t-2xl ${colors.borderSubtle} border-b ${colors.bg} px-5 py-4`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isDark
                  ? "border border-purple-500/30 bg-purple-600/20"
                  : "border border-purple-400/30 bg-purple-500/10"
              }`}
            >
              <Wifi
                className={`h-4 w-4 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <div>
              <p className={`text-sm font-semibold ${colors.text}`}>
                API Server
              </p>
              <p
                className={`font-mono text-[10px] ${isDark ? "text-white/40" : "text-slate-500"}`}
              >
                Port {DEFAULT_PORT}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-md ${isDark ? "text-white/40" : "text-slate-500"} transition-colors ${colors.buttonHover}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className={`text-sm leading-relaxed ${colors.textMuted}`}>
            Enter the IP address of the machine running the backend. This allows
            the app to be accessed from any device on the same network.
          </p>

          <div className="space-y-1.5">
            <label
              className={`text-[11px] font-semibold tracking-[1px] ${colors.textSubtle} uppercase`}
            >
              Server IP Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ip}
                onChange={(e) => {
                  setIp(e.target.value)
                  setError("")
                }}
                placeholder="192.168.1.100"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className={`flex-1 rounded-xl ${colors.inputBorder} border ${colors.inputBg} px-3 py-2.5 font-mono text-sm ${colors.text} transition-all outline-none ${isDark ? "placeholder:text-white/20" : "placeholder:text-slate-400"} ${colors.inputFocus}`}
              />
              <span
                className={`shrink-0 font-mono text-xs ${isDark ? "text-white/25" : "text-slate-400"}`}
              >
                :{DEFAULT_PORT}
              </span>
            </div>
            {error && <p className={`text-xs ${colors.error}`}>{error}</p>}
          </div>

          <div
            className={`flex items-center gap-2 rounded-lg ${colors.border} border ${isDark ? "bg-white/3" : "bg-slate-100"} px-3 py-2`}
          >
            <Server
              className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`}
            />
            <p
              className={`truncate font-mono text-[11px] ${isDark ? "text-white/30" : "text-slate-500"}`}
            >
              {getCachedApiBase()}
            </p>
          </div>

          <button
            onClick={handleSave}
            className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
              saved
                ? isDark
                  ? "border border-green-500/30 bg-green-500/20 text-green-400"
                  : "border border-green-500/50 bg-green-500/10 text-green-700"
                : isDark
                  ? "bg-purple-600/80 text-white hover:bg-purple-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Saved — reloading…
              </span>
            ) : (
              "Save & Apply"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
