"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "../../button"
import { Input } from "../../input"
import { Label } from "../../label"
import { AuthContext } from "../../../../../../apps/web/src/context/auth-context"

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [accessToken, setAccessToken] = React.useState("")
  const { isLoggedIn, setIsLoggedIn, setUserId } = React.useContext(AuthContext)

  const Login = async () => {
    setError("")
    try {
      const response = await fetch("http://localhost:5103/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      })
      const data = await response.json()

      if (response.ok) {
        console.log("Login successful:", data)

        if (data.userId !== undefined && data.userId !== null) {
          setUserId(BigInt(data.userId))
          setAccessToken(data.accessToken)
          console.log("Access Token:", data.accessToken)
          localStorage.setItem("accessToken", data.accessToken)
          if (data.role !== "admin") {
            setError(
              "Permission denied. Use admin account to access this page."
            )
          } else {
            setIsLoggedIn(true)
          }
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Login failed")
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await Login()
  }
  React.useEffect(() => {
    if (isLoggedIn) {
      window.location.href = "/admin"
    }
  }, [isLoggedIn])

  return (
    <div className="grid min-h-screen min-w-screen place-items-center bg-radial-[at_-200%_30%] from-purple-500 to-zinc-900 to-70% p-4">
      <div className="mx-auto w-full max-w-md p-4">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight text-white/80">
          Sign In
        </h2>
        <p className="mb-12 text-center text-base text-muted-foreground">
          Enter your email and password to sign in
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-white/80"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              className="h-11 text-white/90"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-white/90"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-11 pr-10 text-white/80"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 text-white/80"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Sign In
          </Button>
          {error ? (
            <p className="text-sm text-red-500 text-shadow-2xs text-shadow-red-700">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  )
}
