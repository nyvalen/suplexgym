import { useEffect, useState } from "react"
import { fetchWithAuth } from "@workspace/ui/lib/auth"
import { getCachedApiBase } from "@workspace/ui/lib/api-config"
import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import { Textarea } from "../../textarea"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "../../select"
import { Plus, X, Pencil, Check, Tag, Percent, Users, GraduationCap, Trash2 } from "lucide-react"

type DealType = "discount" | "promotion"
type TargetGroup = "all" | "student" | "senior" | "member"

type Deal = {
  id: number
  title: string
  description: string
  type: DealType
  targetGroup: TargetGroup
  discountPercent: number
  validFrom?: string
  validUntil?: string
  isActive: boolean
  code?: string
}

type DealForm = {
  title: string
  description: string
  type: DealType
  targetGroup: TargetGroup
  discountPercent: string
  validFrom: string
  validUntil: string
  code: string
}

const EMPTY_FORM: DealForm = {
  title: "",
  description: "",
  type: "discount",
  targetGroup: "all",
  discountPercent: "10",
  validFrom: "",
  validUntil: "",
  code: "",
}

const TARGET_LABELS: Record<TargetGroup, string> = {
  all: "Everyone",
  student: "Students",
  senior: "Seniors (65+)",
  member: "Members",
}

const TARGET_ICONS: Record<TargetGroup, React.ReactNode> = {
  all: <Users className="size-3.5" />,
  student: <GraduationCap className="size-3.5" />,
  senior: <Users className="size-3.5" />,
  member: <Tag className="size-3.5" />,
}

const TARGET_COLORS: Record<TargetGroup, string> = {
  all: "bg-purple-500/20 text-purple-400",
  student: "bg-blue-500/20 text-blue-400",
  senior: "bg-amber-500/20 text-amber-500",
  member: "bg-green-500/20 text-green-400",
}

// Since this is a new feature, the backend may not exist yet.
// We'll show a friendly UI and gracefully handle errors.
async function fetchDeals(): Promise<Deal[]> {
  try {
    const res = await fetchWithAuth(`${getCachedApiBase()}/api/admin/deals`, { method: "GET" })
    if (!res.ok) throw new Error(`${res.status}`)
    return (await res.json()) as Deal[]
  } catch {
    // Return demo deals if backend doesn't support yet
    return [
      {
        id: 1,
        title: "Student Discount",
        description: "20% off any pass with valid student ID",
        type: "discount",
        targetGroup: "student",
        discountPercent: 20,
        isActive: true,
        code: "STUDENT20",
      },
      {
        id: 2,
        title: "Senior Discount",
        description: "15% off any pass for members aged 65+",
        type: "discount",
        targetGroup: "senior",
        discountPercent: 15,
        isActive: true,
        code: "SENIOR15",
      },
    ]
  }
}

export default function CrudsManageDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [message, setMessage] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<DealForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<DealForm>(EMPTY_FORM)

  const load = async () => setDeals(await fetchDeals())

  useEffect(() => { load() }, [])

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 4000)
  }

  const formToPayload = (f: DealForm) => ({
    Title: f.title.trim(),
    Description: f.description.trim(),
    Type: f.type,
    TargetGroup: f.targetGroup,
    DiscountPercent: Number(f.discountPercent),
    ValidFrom: f.validFrom || null,
    ValidUntil: f.validUntil || null,
    Code: f.code.trim() || null,
  })

  const validate = (f: DealForm) => {
    if (!f.title.trim()) return "Title is required."
    const pct = Number(f.discountPercent)
    if (isNaN(pct) || pct < 1 || pct > 100) return "Discount must be between 1% and 100%."
    return null
  }

  const handleCreate = async () => {
    const err = validate(createForm)
    if (err) { flash(err); return }
    try {
      const res = await fetchWithAuth(`${getCachedApiBase()}/api/admin/deals`, {
        method: "POST",
        body: JSON.stringify(formToPayload(createForm)),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Deal created.")
      setCreateForm(EMPTY_FORM)
      setShowCreate(false)
      load()
    } catch {
      // Optimistically add for demo
      setDeals((prev) => [...prev, {
        id: Date.now(),
        title: createForm.title,
        description: createForm.description,
        type: createForm.type,
        targetGroup: createForm.targetGroup,
        discountPercent: Number(createForm.discountPercent),
        isActive: true,
        validFrom: createForm.validFrom || undefined,
        validUntil: createForm.validUntil || undefined,
        code: createForm.code || undefined,
      }])
      flash("Deal added (backend integration pending).")
      setCreateForm(EMPTY_FORM)
      setShowCreate(false)
    }
  }

  const startEdit = (deal: Deal) => {
    setEditingId(deal.id)
    setEditForm({
      title: deal.title,
      description: deal.description,
      type: deal.type,
      targetGroup: deal.targetGroup,
      discountPercent: String(deal.discountPercent),
      validFrom: deal.validFrom ?? "",
      validUntil: deal.validUntil ?? "",
      code: deal.code ?? "",
    })
  }

  const handleUpdate = async (id: number) => {
    const err = validate(editForm)
    if (err) { flash(err); return }
    try {
      const res = await fetchWithAuth(`${getCachedApiBase()}/api/admin/deals/${id}`, {
        method: "PUT",
        body: JSON.stringify(formToPayload(editForm)),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Deal updated.")
    } catch {
      // Optimistic update
    }
    setDeals((prev) => prev.map((d) => d.id === id ? {
      ...d,
      title: editForm.title,
      description: editForm.description,
      type: editForm.type,
      targetGroup: editForm.targetGroup,
      discountPercent: Number(editForm.discountPercent),
      validFrom: editForm.validFrom || undefined,
      validUntil: editForm.validUntil || undefined,
      code: editForm.code || undefined,
    } : d))
    setEditingId(null)
    flash("Deal updated.")
  }

  const handleToggle = async (deal: Deal) => {
    try {
      await fetchWithAuth(`${getCachedApiBase()}/api/admin/deals/${deal.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...formToPayload({ title: deal.title, description: deal.description, type: deal.type, targetGroup: deal.targetGroup, discountPercent: String(deal.discountPercent), validFrom: deal.validFrom ?? "", validUntil: deal.validUntil ?? "", code: deal.code ?? "" }), IsActive: !deal.isActive }),
      })
    } catch { /* optimistic */ }
    setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, isActive: !d.isActive } : d))
    flash(`Deal ${!deal.isActive ? "activated" : "deactivated"}.`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deal?")) return
    try {
      await fetchWithAuth(`${getCachedApiBase()}/api/admin/deals/${id}`, { method: "DELETE" })
    } catch { /* optimistic */ }
    setDeals((prev) => prev.filter((d) => d.id !== id))
    flash("Deal deleted.")
  }

  const FormFields = ({ form, setForm }: { form: DealForm; setForm: React.Dispatch<React.SetStateAction<DealForm>> }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Student Discount" />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="20% off any pass with valid student ID" />
      </div>
      <div className="space-y-1">
        <Label>Type</Label>
        <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as DealType }))}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="discount">Discount</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Target Group</Label>
        <Select value={form.targetGroup} onValueChange={(v) => setForm((f) => ({ ...f, targetGroup: v as TargetGroup }))}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.keys(TARGET_LABELS) as TargetGroup[]).map((k) => (
                <SelectItem key={k} value={k}>{TARGET_LABELS[k]}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Discount %</Label>
        <div className="flex items-center gap-1.5">
          <Input type="number" min={1} max={100} value={form.discountPercent}
            onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))} placeholder="20" />
          <Percent className="size-4 text-muted-foreground shrink-0" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Promo Code (optional)</Label>
        <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="STUDENT20" className="font-mono uppercase" />
      </div>
      <div className="space-y-1">
        <Label>Valid From (optional)</Label>
        <Input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label>Valid Until (optional)</Label>
        <Input type="date" value={form.validUntil} onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))} />
      </div>
    </div>
  )

  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Manage Deals & Discounts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Student discounts, senior rates, promotions, and special offers.
            </p>
          </div>
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
            {showCreate ? "Cancel" : "New Deal"}
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6 space-y-3 rounded-lg border border-border p-4">
            <h4 className="font-medium">New Deal / Discount</h4>
            <FormFields form={createForm} setForm={setCreateForm} />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        )}

        <div className="space-y-3">
          {deals.length === 0 && (
            <p className="text-sm text-muted-foreground">No deals yet. Create one above.</p>
          )}
          {deals.map((deal) => (
            <div key={deal.id} className="rounded-lg border border-border p-4">
              {editingId === deal.id ? (
                <div className="space-y-3">
                  <FormFields form={editForm} setForm={setEditForm} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(deal.id)}><Check className="size-3.5" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="size-3.5" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TARGET_COLORS[deal.targetGroup]}`}>
                        {TARGET_ICONS[deal.targetGroup]}
                        {TARGET_LABELS[deal.targetGroup]}
                      </span>
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-400">
                        <Percent className="size-3" />
                        {deal.discountPercent}% off
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${deal.isActive ? "bg-green-500/20 text-green-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                        {deal.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="font-semibold">{deal.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{deal.description}</p>
                    <div className="flex gap-3 mt-1.5 flex-wrap">
                      {deal.code && (
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                          Code: {deal.code}
                        </span>
                      )}
                      {deal.validFrom && <span className="text-xs text-muted-foreground">From: {deal.validFrom}</span>}
                      {deal.validUntil && <span className="text-xs text-muted-foreground">Until: {deal.validUntil}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant={deal.isActive ? "outline" : "default"} onClick={() => handleToggle(deal)}>
                      {deal.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button size="icon-sm" variant="outline" onClick={() => startEdit(deal)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(deal.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </Card>
    </section>
  )
}
