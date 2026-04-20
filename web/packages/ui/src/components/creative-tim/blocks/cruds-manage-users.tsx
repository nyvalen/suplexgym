import { useEffect, useState } from "react"
import {
  fetchWithAuth,
  getFoundingAdminId,
  isProtectedAction,
} from "@workspace/ui/lib/auth"
import { API_ENDPOINTS } from "@workspace/ui/lib/api-config"
import { Button } from "../../button"
import { Card } from "../../card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible"
import { ShieldAlert } from "lucide-react"

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

// Role badge colors
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-400",
  staff: "bg-amber-500/20 text-amber-500",
  user: "bg-blue-500/20 text-blue-400",
}

async function fetchUsers(): Promise<UsersItem[]> {
  try {
    const res = await fetchWithAuth(API_ENDPOINTS.adminUsers, { method: "GET" })
    if (!res.ok) throw new Error(`Failed fetch users: ${res.status}`)
    return (await res.json()) as UsersItem[]
  } catch (err) {
    console.error("Error fetching users:", err)
    return []
  }
}

async function fetchRoles(): Promise<RoleItem[]> {
  try {
    const res = await fetchWithAuth(API_ENDPOINTS.adminRoles, { method: "GET" })
    if (res.status === 401) {
      window.location.href = "/"
    }
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
  const [selectedRoleIds, setSelectedRoleIds] = useState<Record<number, number>>({})
  const [message, setMessage] = useState("")
  const [foundingAdminId, setFoundingAdminId] = useState<number | null>(null)

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 4000)
  }

  const loadUsers = async () => {
    try {
      const [users, fetchedRoles] = await Promise.all([fetchUsers(), fetchRoles()])
      setData(users)
      setRoles(fetchedRoles)
      setFoundingAdminId(getFoundingAdminId(users))
      setSelectedRoleIds(
        Object.fromEntries(
          users.map((item) => {
            const roleObject = fetchedRoles.find((r) => r.role === item.role)
            return [item.id, roleObject?.id ?? 0]
          })
        )
      )
    } catch (error) {
      console.error("Failed to load users", error)
      flash("Unable to load users.")
    }
  }

  useEffect(() => { loadUsers() }, [])

  const updateUserRole = async (id: number) => {
    if (isProtectedAction(id, foundingAdminId, "role-change")) {
      flash("The founding admin's role cannot be changed.")
      return
    }

    const user = data.find((u) => u.id === id)
    if (!user) return

    const selectedRoleId = selectedRoleIds[id] || roles.find((r) => r.role === user.role)?.id
    if (!selectedRoleId) {
      flash("Could not determine role id to update.")
      return
    }

    const selectedRoleName = roles.find((r) => r.id === selectedRoleId)?.role ?? user.role

    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.adminUsers}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ RoleId: selectedRoleId, IsActive: user.isActive }),
      })
      if (!response.ok) throw new Error(`Failed to update user: ${response.status}`)
      setData((prev) => prev.map((u) => (u.id === id ? { ...u, role: selectedRoleName } : u)))
      flash("User role updated successfully.")
    } catch (error) {
      console.error("Update failed", error)
      flash("Update failed. Check console.")
    }
  }

  const toggleActive = async (id: number) => {
    if (isProtectedAction(id, foundingAdminId, "deactivate")) {
      flash("The founding admin cannot be deactivated.")
      return
    }

    const user = data.find((u) => u.id === id)
    if (!user) return

    try {
      const response = await fetchWithAuth(`${API_ENDPOINTS.adminUsers}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ IsActive: !user.isActive }),
      })
      if (!response.ok) throw new Error(`Failed to toggle active: ${response.status}`)
      setData((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)))
      flash(`User ${!user.isActive ? "activated" : "deactivated"} successfully.`)
    } catch (error) {
      console.error("Toggle active failed", error)
      flash("Toggle active failed. Check console.")
    }
  }

  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Manage Users</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View and update user roles and active status.
            </p>
          </div>
          {foundingAdminId !== null && (
            <div className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-3.5 shrink-0" />
              Founding admin (ID {foundingAdminId}) is protected
            </div>
          )}
        </div>

        {/* Role legend */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {Object.entries(ROLE_COLORS).map(([role, cls]) => (
            <span key={role} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
              {role}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          <div className="container mx-auto flex-row items-start gap-6">
            {data.map(({ id, name, username, email, role, isActive, createdAt }) => {
              const isFounder = id === foundingAdminId
              const roleBadgeCls = ROLE_COLORS[role] ?? "bg-zinc-500/20 text-zinc-400"
              return (
                <Collapsible
                  key={id}
                  open={openItemIds.includes(id)}
                  onOpenChange={(isOpen) => {
                    setOpenItemIds((prev) =>
                      isOpen ? [...new Set([...prev, id])] : prev.filter((i) => i !== id)
                    )
                  }}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded p-2 hover:bg-muted/50 transition-colors">
                    <span className="font-semibold">{username}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isFounder && (
                        <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-600 dark:text-amber-400">
                          <ShieldAlert className="size-3" /> Founding Admin
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${isActive ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-500"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${roleBadgeCls}`}>
                        {role}
                      </span>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2 overflow-hidden rounded-lg border border-border p-4 shadow-sm">
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
                        <p className="font-medium">{isActive ? "Active" : "Inactive"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {isFounder && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="size-3.5" />
                        This is the founding admin — role changes and deactivation are blocked.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Select
                        disabled={isFounder}
                        onValueChange={(value) =>
                          setSelectedRoleIds((prev) => ({ ...prev, [id]: Number(value) }))
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue
                            placeholder={
                              roles.find((r) => r.id === selectedRoleIds[id])?.role ?? role
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="w-36">
                          <SelectGroup>
                            {roles.map((roleOption) => (
                              <SelectItem key={roleOption.id} value={`${roleOption.id}`}>
                                <span className={`mr-2 inline-block w-2 h-2 rounded-full ${
                                  roleOption.role === "admin" ? "bg-purple-400" :
                                  roleOption.role === "staff" ? "bg-amber-400" : "bg-blue-400"
                                }`} />
                                {roleOption.role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      <Button type="button" disabled={isFounder} onClick={() => updateUserRole(id)}>
                        Save Role
                      </Button>

                      <Button
                        type="button"
                        variant={isActive ? "destructive" : "outline"}
                        disabled={isFounder}
                        onClick={() => toggleActive(id)}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>

          {message && (
            <p className="mt-4 text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </Card>
    </section>
  )
}
