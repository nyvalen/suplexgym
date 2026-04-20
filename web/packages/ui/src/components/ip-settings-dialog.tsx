"use client"

import * as React from "react"
import { Server, X, Check, Wifi } from "lucide-react"
import { getCachedApiBase, setApiIp, getStoredApiIp, DEFAULT_PORT } from "../lib/api-config"

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">API Server</p>
              <p className="text-[10px] text-white/40 font-mono">Port {DEFAULT_PORT}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-white/50 leading-relaxed">
            Enter the IP address of the machine running the backend. This allows the app to be accessed from any device on the same network.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-[1px] uppercase text-white/40">
              Server IP Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ip}
                onChange={(e) => { setIp(e.target.value); setError("") }}
                placeholder="192.168.1.100"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono placeholder:text-white/20 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
              />
              <span className="text-xs text-white/25 font-mono shrink-0">:{DEFAULT_PORT}</span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div
            className="rounded-lg bg-white/3 border border-white/5 px-3 py-2 flex items-center gap-2"
          >
            <Server className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <p className="text-[11px] text-white/30 font-mono truncate">
              {getCachedApiBase()}
            </p>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-purple-600/80 hover:bg-purple-600 text-white"
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Saved — reloading…
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
