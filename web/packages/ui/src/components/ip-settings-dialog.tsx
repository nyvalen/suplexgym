"use client"

import * as React from "react"
import { Server, X, Check, Wifi } from "lucide-react"
import {
  getCachedApiBase,
  setApiIp,
  getStoredApiIp,
  DEFAULT_PORT,
} from "../lib/api-config"

interface IpSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function IpSettingsDialog({ open, onClose }: IpSettingsDialogProps) {
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

  if (!open) return null

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
      window.location.reload()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-600/20">
              <Wifi className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">API Server</p>
              <p className="font-mono text-[10px] text-white/40">
                Port {DEFAULT_PORT}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/8 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-relaxed text-white/50">
            Enter the IP address of the machine running the backend. This allows
            the app to be accessed from any device on the same network.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-[1px] text-white/40 uppercase">
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
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white transition-all outline-none placeholder:text-white/20 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
              />
              <span className="shrink-0 font-mono text-xs text-white/25">
                :{DEFAULT_PORT}
              </span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/3 px-3 py-2">
            <Server className="h-3.5 w-3.5 shrink-0 text-white/30" />
            <p className="truncate font-mono text-[11px] text-white/30">
              {getCachedApiBase()}
            </p>
          </div>

          <button
            onClick={handleSave}
            className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
              saved
                ? "border border-green-500/30 bg-green-500/20 text-green-400"
                : "bg-purple-600/80 text-white hover:bg-purple-600"
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
