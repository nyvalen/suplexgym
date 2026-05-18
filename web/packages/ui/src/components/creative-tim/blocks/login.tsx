"use client"

import * as React from "react"
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "../../button"
import { Input } from "../../input"
import { Label } from "../../label"
import { AuthContext } from "../../../../../../apps/web/src/context/auth-context"
import { useTranslation } from "react-i18next"
import { Language } from "../../language"
import { Link } from "react-router-dom"
import { API_ENDPOINTS } from "@workspace/ui/lib/api-config"

const PRIVILEGED_ROLES = ["admin", "staff"]

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return "Email address is required."
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address."
  return null
}

function validatePasswordPresence(password: string): string | null {
  if (!password) return "Password is required."
  return null
}

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

// ─── Inline field error ───────────────────────────────────────────────────────

function FieldError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Login() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [serverError, setServerError] = React.useState("")
  const [checking, setChecking] = React.useState(true)
  const [shake, setShake] = React.useState(false)
  const { isLoggedIn, setIsLoggedIn, setUserId } = React.useContext(AuthContext)

  // ── Auto-redirect if already authenticated ────────────────────────────────
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token && token !== "") {
      if (isTokenStillValid(token)) {
        const payload = decodeTokenPayload(token)
        if (payload && PRIVILEGED_ROLES.includes(payload.role)) {
          window.location.replace("/admin")
          return
        }
        setChecking(false)
        return
      }

      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) {
        fetch(API_ENDPOINTS.refresh, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
          .then((res) => {
            if (res.ok) {
              return res.json().then((data) => {
                localStorage.setItem("accessToken", data.accessToken)
                if (data.refreshToken)
                  localStorage.setItem("refreshToken", data.refreshToken)
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

  // ── Shake animation ───────────────────────────────────────────────────────
  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  // ── Validate fields ───────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const eErr = validateEmail(email)
    const pErr = validatePasswordPresence(password)
    setEmailError(eErr)
    setPasswordError(pErr)
    if (eErr || pErr) {
      triggerShake()
      return false
    }
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const doLogin = async () => {
    setServerError("")
    if (!validateForm()) return

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await response.json()

      if (response.ok) {
        if (data.userId !== undefined && data.userId !== null) {
          setUserId(BigInt(data.userId))

          if (!PRIVILEGED_ROLES.includes(data.role)) {
            setServerError(t("login.errorPermission"))
            triggerShake()
            return
          }

          localStorage.setItem("accessToken", data.accessToken)
          if (data.refreshToken)
            localStorage.setItem("refreshToken", data.refreshToken)
          setIsLoggedIn(true)
        }
      } else {
        const msg: string = data?.message ?? ""
        if (
          msg.toLowerCase().includes("disabled") ||
          msg.toLowerCase().includes("inactive")
        ) {
          setServerError(
            "This account has been deactivated. Please contact an administrator."
          )
        } else if (
          msg.toLowerCase().includes("invalid") ||
          response.status === 401
        ) {
          setServerError(t("login.errorDefault"))
        } else {
          setServerError(msg || t("login.errorDefault"))
        }
        triggerShake()
      }
    } catch {
      setServerError(t("login.errorDefault"))
      triggerShake()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doLogin()
  }

  React.useEffect(() => {
    if (isLoggedIn) window.location.href = "/admin"
  }, [isLoggedIn])

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="grid min-h-screen min-w-screen place-items-center bg-radial-[at_-200%_30%] from-purple-500 to-zinc-900 to-70%">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          <p className="text-xs tracking-widest text-white/40 uppercase">
            Checking session…
          </p>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid min-h-screen min-w-screen place-items-center bg-radial-[at_-200%_40%] from-purple-500 to-zinc-900 to-70% p-4">
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("nav.backHome")}
        </Link>
      </div>
      <div className="absolute bottom-2 left-2">
        <Language />
      </div>

      <div
        className={`mx-auto w-full max-w-md p-4 transition-transform duration-100 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
        style={
          shake
            ? {
                animation:
                  "shake 0.4s ease-in-out",
              }
            : {}
        }
      >
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white/80">
          {t("login.title")}
        </h2>
        <p className="mb-10 text-center text-base text-muted-foreground">
          {t("login.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-white/80"
            >
              {t("login.email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              className={`h-11 text-white/90 transition-colors ${
                emailError
                  ? "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                  : ""
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError(null)
                setServerError("")
              }}
              autoComplete="email"
              autoCapitalize="none"
            />
            <FieldError message={emailError} />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-white/90"
            >
              {t("login.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`h-11 pr-10 text-white/80 transition-colors ${
                  passwordError
                    ? "border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                    : ""
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError(null)
                  setServerError("")
                }}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 text-white/80"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
            <FieldError message={passwordError} />
          </div>

          {/* Submit button */}
          <Button type="submit" size="lg" className="w-full">
            {t("login.submit")}
          </Button>

          {/* Server / permission error */}
          {serverError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <p className="text-sm leading-relaxed text-red-400">
                {serverError}
              </p>
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-xs text-white/25">
          {t("login.staffHint")}
        </p>
      </div>

      {/* Shake keyframes injected inline for non-Tailwind environments */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-7px); }
          30%       { transform: translateX(7px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </div>
  )
}
