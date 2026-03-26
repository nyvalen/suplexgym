import { LogOut } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useTheme } from "../../../../apps/web/src/components/theme-provider"
import { Button } from "@workspace/ui/components/button"

export function Logout() {
  const { setTheme } = useTheme()

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
          onClick={() => {
            localStorage.setItem("accessToken", "")
            window.location.href = "/"
          }}
        >
          Are you sure you want to log out?
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
