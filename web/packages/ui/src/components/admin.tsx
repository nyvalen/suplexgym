import { UserRoundKey } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useNavigate } from "react-router-dom"

function decodeToken(token: string) {
  const payload = token.split(".")[1]

  const decoded = atob(payload)

  return JSON.parse(decoded)
}

const token = localStorage.getItem("accessToken")

console.log(token)

const data =
  token !== undefined && token !== null && token != "" ? decodeToken(token) : ""
export function Admin() {
  const navigate = useNavigate()
  return (
    <>
      <Button
        variant="ghost"
        className="h-8 flex-1 gap-3 rounded-md transition-colors hover:bg-accent data-[state=open]:bg-accent"
        onClick={() => {
          {
            console.log("Decoded Token Data:", data)
            data == "admin" ? navigate("/admin") : navigate("/login")
          }
        }}
      >
        <UserRoundKey className="h-[1.2rem] w-[1.2rem] scale-100 transition-all" />
        <span>Go to admin panel</span>
      </Button>
    </>
  )
}
