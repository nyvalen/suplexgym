import { useEffect, useRef, useState } from "react"
import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../select"
import { Textarea } from "../../textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible"
type UsersItem = {
  id: number
  name: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}
async function fetchNews(): Promise<UsersItem[]> {
  try {
    const res = await fetch("http://localhost:5103/api/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
    if (!res.ok) throw new Error("Failed fetch")
    return (await res.json()) as UsersItem[]
  } catch (err) {
    console.error("Error fetching news:", err)
    return []
  }
}

export default function CrudsGetUsers() {
  const [data, setData] = useState<UsersItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    fetchNews().then((items) => {
      if (active) setData(items)
    })
    return () => {
      active = false
    }
  }, [])
  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Manage users</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View users' email address, billing address, role, name, username.
          </p>
        </div>
        <div className="space-y-2">
          <div className="container mx-auto flex-row items-start gap-6">
            {data.map(
              ({ id, name, username, email, role, isActive, createdAt }) => (
                <Collapsible open={open} onOpenChange={setOpen}>
                  <CollapsibleTrigger>{username}</CollapsibleTrigger>
                  <CollapsibleContent>
                    {id} {name} {email}
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={role} />
                      </SelectTrigger>
                      <SelectContent className="w-40">
                        <SelectGroup>
                          {data.map(({ role }) => (
                            <SelectItem value={role}>{role}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                      <Button type="submit" className="flex-1">
                        Confirm
                      </Button>
                    </Select>{" "}
                    {isActive} {createdAt}
                  </CollapsibleContent>
                </Collapsible>
              )
            )}
          </div>
          <div className="flex gap-4"></div>
        </div>
      </Card>
    </section>
  )
}
