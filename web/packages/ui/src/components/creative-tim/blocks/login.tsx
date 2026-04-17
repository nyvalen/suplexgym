"use client"

import * as React from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "../../button"
import { Input } from "../../input"
import { Label } from "../../label"
import { AuthContext } from "../../../../../../apps/web/src/context/auth-context"
import { useTranslation } from "react-i18next"
import { Language } from "../../language"
import { Link } from "react-router-dom"

const PRIVILEGED_ROLES = ["admin", "staff"]

function decodeTokenPayload(token: string): Record<string, string> | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function isTokenStillValid(token: string): boolean {
  const payload = decodeTokenPayload(token)
  if (!payload) return false
  const exp = Number(payload.exp ?? 0)
  return Date.now() / 1000 < exp - 10
}

export default function Login({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [checking, setChecking] = React.useState(true)
  const { isLoggedIn, setIsLoggedIn, setUserId } = React.useContext(AuthContext)

  // ── Auto-redirect if already logged in ─────────────────────────────────────
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token && token !== "") {
      if (isTokenStillValid(token)) {
        const payload = decodeTokenPayload(token)
        if (payload && PRIVILEGED_ROLES.includes(payload.role)) {
          window.location.replace("/admin")
          return
        }
        // Not a privileged role — stay on login
        setChecking(false)
        return
      }

      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        fetch("http://localhost:5103/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
          .then((res) => {
            if (res.ok) {
              return res.json().then((data) => {
                localStorage.setItem("accessToken", data.accessToken)
                if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
                const payload = decodeTokenPayload(data.accessToken)
                if (payload && PRIVILEGED_ROLES.includes(payload.role)) {
                  window.location.replace("/admin")
                } else {
                  localStorage.removeItem("accessToken")
                  localStorage.removeItem("refreshToken")
                  setChecking(false)
                }
              })
            } else {
              localStorage.removeItem("accessToken")
              localStorage.removeItem("refreshToken")
              setChecking(false)
            }
          })
          .catch(() => setChecking(false))
      } else {
        localStorage.removeItem("accessToken")
        setChecking(false)
      }
    } else {
      setChecking(false)
    }
  }, [])

  const doLogin = async () => {
    setError("")
    try {
      const response = await fetch("http://localhost:5103/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        if (data.userId !== undefined && data.userId !== null) {
          setUserId(BigInt(data.userId))

          if (!PRIVILEGED_ROLES.includes(data.role)) {
            setError(t("login.errorPermission"))
            return
          }

          localStorage.setItem("accessToken", data.accessToken)
          if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
          setIsLoggedIn(true)
        }
      } else {
        setError(t("login.errorDefault"))
      }
    } catch {
      setError(t("login.errorDefault"))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doLogin()
  }

  React.useEffect(() => {
    if (isLoggedIn) window.location.href = "/admin"
  }, [isLoggedIn])

  if (checking) {
    return (
      <div className="grid min-h-screen min-w-screen place-items-center bg-radial-[at_-200%_30%] from-purple-500 to-zinc-900 to-70%">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          <p className="text-xs tracking-widest text-white/40 uppercase">Checking session…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen min-w-screen place-items-center bg-radial-[at_-200%_40%] from-purple-500 to-zinc-900 to-70% p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="mb-4 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70">
          <ArrowLeft className="h-3 w-3" />
          {t("nav.backHome")}
        </Link>
      </div>
      <div className="absolute bottom-2 left-2"><Language /></div>

      <div className="mx-auto w-full max-w-md p-4">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white/80">
          {t("login.title")}
        </h2>
        <p className="mb-12 text-center text-base text-muted-foreground">
          {t("login.subtitle")}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-white/80">{t("login.email")}</Label>
            <Input
              id="email" type="email" placeholder={t("login.emailPlaceholder")}
              className="h-11 text-white/90" value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-white/90">{t("login.password")}</Label>
            <div className="relative">
              <Input
                id="password" type={showPassword ? "text" : "password"}
                className="h-11 pr-10 text-white/80" value={password}
                onChange={(e) => setPassword(e.target.value)} required
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 text-white/80"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full">{t("login.submit")}</Button>
          {error && <p className="text-sm text-red-500 text-shadow-2xs text-shadow-red-700">{error}</p>}
        </form>
        {/* Hint that both admin and staff can log in */}
        <p className="mt-8 text-center text-xs text-white/25">
          {t("login.staffHint")}
        </p>
      </div>
    </div>
  )
}
