import { LogOut } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { AuthContext } from "../../../../apps/web/src/context/auth-context"
import { useContext } from "react"
import { fetchWithAuth } from "../lib/auth"

export function Logout() {
  const { setIsLoggedIn } = useContext(AuthContext)
  const Logout = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:5103/api/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )

      if (response.ok) {
        console.log("Logout successful")
        setIsLoggedIn(false)
        localStorage.setItem("accessToken", "")
        window.location.href = "/"
      }
    } catch (err) {
      console.error("Logout error:", err)
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
