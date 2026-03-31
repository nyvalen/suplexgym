import { useEffect, useState } from "react"
import { fetchWithAuth, authTokens } from "@workspace/ui/lib/auth"
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
type RoleItem = {
  id: number
  role: string
}

async function fetchUsers(): Promise<UsersItem[]> {
  try {
    const res = await fetchWithAuth("http://localhost:5103/api/admin/users", {
      method: "GET",
    })
    if (!res.ok) throw new Error(`Failed fetch users: ${res.status}`)
    return (await res.json()) as UsersItem[]
  } catch (err) {
    console.error("Error fetching users:", err)
    return []
  }
}

async function fetchRoles(): Promise<RoleItem[]> {
  try {
    const res = await fetchWithAuth("http://localhost:5103/api/admin/roles", {
      method: "GET",
    })
    if (!res.ok) throw new Error(`Failed fetch roles: ${res.status}`)
    return (await res.json()) as RoleItem[]
  } catch (err) {
    console.error("Error fetching roles:", err)
    return []
  }
}

export default function CrudsManageUsers() {
  const [data, setData] = useState<UsersItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [openItemIds, setOpenItemIds] = useState<number[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<
    Record<number, number>
  >({})
  const [message, setMessage] = useState<string>("")

  const loadUsers = async () => {
    try {
      const [users, roles] = await Promise.all([fetchUsers(), fetchRoles()])
      setData(users)
      setRoles(roles)
      setSelectedRoleIds(
        Object.fromEntries(
          users.map((item) => {
            const roleObject = roles.find((r) => r.role === item.role)
            return [item.id, roleObject?.id ?? 0]
          })
        )
      )
    } catch (error) {
      console.error("Failed to load users", error)
      setMessage("Unable to load users.")
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const roleOptions = roles

  const updateUser = async (id: number) => {
    const user = data.find((u) => u.id === id)
    if (!user) return

    const selectedRoleId =
      selectedRoleIds[id] || roles.find((r) => r.role === user.role)?.id
    if (!selectedRoleId) {
      setMessage("Could not determine role id to update.")
      return
    }

    const selectedRoleName =
      roles.find((r) => r.id === selectedRoleId)?.role ?? user.role

    try {
      const response = await fetchWithAuth(
        `http://localhost:5103/api/admin/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            RoleId: selectedRoleId,
            IsActive: user.isActive,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`)
      }

      setData((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                role: selectedRoleName,
              }
            : u
        )
      )
      setMessage("User updated successfully.")
    } catch (error) {
      console.error("Update failed", error)
      setMessage("Update failed. Check console.")
    }
  }

  const toggleActive = async (id: number) => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setMessage("Not authenticated. Please log in.")
      return
    }

    const user = data.find((u) => u.id === id)
    if (!user) return

    try {
      const response = await fetchWithAuth(
        `http://localhost:5103/api/admin/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            IsActive: !user.isActive,
          }),
        }
      )
      if (!response.ok)
        throw new Error(`Failed to toggle active: ${response.status}`)

      setData((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
      )
      setMessage(
        `User ${!user.isActive ? "activated" : "deactivated"} successfully.`
      )
    } catch (error) {
      console.error("Toggle active failed", error)
      setMessage("Toggle active failed. Check console.")
    }
  }

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
                <Collapsible
                  key={id}
                  open={openItemIds.includes(id)}
                  onOpenChange={(isOpen) => {
                    setOpenItemIds((prev) => {
                      if (isOpen) {
                        return [...new Set([...prev, id])]
                      }
                      return prev.filter((itemId) => itemId !== id)
                    })
                  }}
                >
                  <CollapsibleTrigger className="rounded p-2 font-semibold">
                    {username}
                  </CollapsibleTrigger>
                  <CollapsibleContent
                    className={`mt-2 origin-top transform overflow-hidden rounded-lg border border-slate-200 p-4 shadow-sm ${
                      openItemIds.includes(id)
                        ? "max-h-96 scale-y-100 opacity-100"
                        : "max-h-0 scale-y-95 opacity-0"
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="truncate font-medium">{email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {new Date(createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3 text-center">
                      <p>Role</p>
                      <div className="flex items-center justify-center gap-2">
                        <Select
                          onValueChange={(value) =>
                            setSelectedRoleIds((prev) => ({
                              ...prev,
                              [id]: Number(value),
                            }))
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue
                              placeholder={
                                roles.find((r) => r.id === selectedRoleIds[id])
                                  ?.role ?? role
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="w-40">
                            <SelectGroup>
                              {roleOptions.map((roleOption) => (
                                <SelectItem
                                  key={roleOption.id}
                                  value={`${roleOption.id}`}
                                >
                                  {roleOption.role}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          className="h-10"
                          onClick={() => updateUser(id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          type="button"
                          variant={isActive ? "destructive" : "outline"}
                          className="h-10"
                          onClick={() => toggleActive(id)}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            )}
          </div>
          <div className="mt-4">
            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : null}
          </div>
        </div>
      </Card>
    </section>
  )
}
