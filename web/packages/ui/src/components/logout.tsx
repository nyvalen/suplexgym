import { LogOut } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useTheme } from "../../../../apps/web/src/components/theme-provider"
import { Button } from "@workspace/ui/components/button"
import { AuthContext } from "../../../../apps/web/src/context/auth-context"
import { useContext, useEffect, useState } from "react"

export function Logout() {
  const [error, setError] = useState("")

  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext)
  const Logout = async () => {
    setError("")
    try {
      const response = await fetch("http://localhost:5103/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        console.log("Logout successful:", data)
        setIsLoggedIn(false)
        localStorage.setItem("accessToken", "")
        window.location.href = "/"
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Login failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }
  const handleClick = async () => {
    await Logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="m-2 h-9 w-9 rounded-md transition-colors hover:bg-accent data-[state=open]:bg-accent"
      >
        <Button variant="outline" size="icon">
          <LogOut className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem
          className="w-full p-1.5"
          onClick={() => handleClick()}
        >
          Are you sure you want to log out?
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
