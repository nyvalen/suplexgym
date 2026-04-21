import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { fetchWithAuth } from "@workspace/ui/lib/auth"
import { API_ENDPOINTS } from "@workspace/ui/lib/api-config"
import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "../../select"
import { Plus, Trash2, X } from "lucide-react"

type Equipment = {
  id: number
  name: string
  serialNumber: number
  status: string
  isActive: boolean
  modifiedAt: string
}

const STATUSES = ["operational", "maintenance", "out_of_order"] as const
type Status = (typeof STATUSES)[number]

const STATUS_LABELS: Record<Status, string> = {
  operational: "Operational",
  maintenance: "Maintenance",
  out_of_order: "Out of Order",
}

const STATUS_COLORS: Record<Status, string> = {
  operational: "bg-green-500/20 text-green-600 dark:text-green-400",
  maintenance: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  out_of_order: "bg-red-500/20 text-red-500",
}

type CreateForm = { name: string; serialNumber: string; status: Status }
const EMPTY_FORM: CreateForm = { name: "", serialNumber: "", status: "operational" }

async function fetchEquipment(): Promise<Equipment[]> {
  try {
    const res = await fetchWithAuth(API_ENDPOINTS.adminEquipment, { method: "GET" })
    if (!res.ok) throw new Error(`${res.status}`)
    return (await res.json()) as Equipment[]
  } catch (err) {
    console.error("fetchEquipment error:", err)
    return []
  }
}

export default function CrudsManageEquipment() {
  const { t } = useTranslation()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [message, setMessage] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_FORM)
  const [pendingStatus, setPendingStatus] = useState<Record<number, Status>>({})

  const load = async () => {
    const items = await fetchEquipment()
    setEquipment(items)
    setPendingStatus(Object.fromEntries(items.map((e) => [e.id, e.status as Status])))
  }

  useEffect(() => { load() }, [])

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 4000)
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) { flash("Name is required."); return }
    const serial = Number(createForm.serialNumber)
    if (!createForm.serialNumber || isNaN(serial) || serial < 0) { flash("Valid serial number is required."); return }
    try {
      const res = await fetchWithAuth(API_ENDPOINTS.adminEquipment, {
        method: "POST",
        body: JSON.stringify({
          Name: createForm.name.trim(),
          SerialNumber: serial,
          Status: createForm.status,
        }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Equipment added.")
      setCreateForm(EMPTY_FORM)
      setShowCreate(false)
      load()
    } catch {
      flash("Failed to add equipment.")
    }
  }

  const handleStatusUpdate = async (id: number) => {
    const status = pendingStatus[id]
    if (!status) return
    try {
      const res = await fetchWithAuth(`${API_ENDPOINTS.adminEquipment}/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ Status: status }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
      flash("Status updated.")
    } catch {
      flash("Failed to update status.")
    }
  }

  const handleRemove = async (id: number) => {
    if (!confirm("Remove this equipment?")) return
    try {
      const res = await fetchWithAuth(`${API_ENDPOINTS.adminEquipment}/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Equipment removed.")
      load()
    } catch {
      flash("Failed to remove equipment.")
    }
  }

  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">{t("cruds.equipment.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("cruds.equipment.description")}</p>
          </div>
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
            {showCreate ? t("cruds.equipment.cancel") : t("cruds.equipment.addEquipment")}
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6 space-y-3 rounded-lg border border-border p-4">
            <h4 className="font-medium">New Equipment</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Name</Label>
                <Input value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Treadmill" />
              </div>
              <div className="space-y-1">
                <Label>Serial Number</Label>
                <Input type="number" min={0} value={createForm.serialNumber}
                  onChange={(e) => setCreateForm((f) => ({ ...f, serialNumber: e.target.value }))}
                  placeholder="100001" />
              </div>
              <div className="space-y-1">
                <Label>Initial Status</Label>
                <Select value={createForm.status}
                  onValueChange={(v) => setCreateForm((f) => ({ ...f, status: v as Status }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate}>Add</Button>
          </div>
        )}

        <div className="space-y-3">
          {equipment.length === 0 && (
            <p className="text-sm text-muted-foreground">No equipment found.</p>
          )}
          {equipment.map((item) => {
            const current = pendingStatus[item.id] ?? (item.status as Status)
            const changed = current !== item.status
            return (
              <div key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name}</p>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[item.status as Status] ?? ""}`}>
                      {STATUS_LABELS[item.status as Status] ?? item.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Serial: {item.serialNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={current}
                    onValueChange={(v) => setPendingStatus((prev) => ({ ...prev, [item.id]: v as Status }))}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant={changed ? "default" : "outline"} disabled={!changed}
                    onClick={() => handleStatusUpdate(item.id)}>
                    Save
                  </Button>
                  <Button size="icon-sm" variant="destructive" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </Card>
    </section>
  )
}
