import { useEffect, useState } from "react"
import { fetchWithAuth } from "@workspace/ui/lib/auth"
import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import { Textarea } from "../../textarea"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "../../select"
import { Pencil, X, Check, Plus, PackageX } from "lucide-react"
import { ImageUpload } from "../../image-upload"

const API_BASE = "http://localhost:5103"

type ItemType = { id: number; type: string | null }

type Item = {
  id: number
  name: string | null
  description: string | null
  imagePath: string | null
  price: number
  validityDays: number
  typeName: string | null
  type_id: number
}

type ItemForm = {
  name: string
  description: string
  imagePath: string
  price: string
  type_id: string
  validityDays: string
}

const EMPTY_FORM: ItemForm = {
  name: "", description: "", imagePath: "", price: "", type_id: "", validityDays: "",
}

async function fetchItems(): Promise<Item[]> {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/items`, { method: "GET" })
    if (!res.ok) throw new Error(`${res.status}`)
    return (await res.json()) as Item[]
  } catch { return [] }
}

async function fetchTypes(): Promise<ItemType[]> {
  try {
    const res = await fetchWithAuth(`${API_BASE}/api/items/types`, { method: "GET" })
    if (!res.ok) throw new Error(`${res.status}`)
    return (await res.json()) as ItemType[]
  } catch { return [] }
}

export default function CrudsManageItems() {
  const [items, setItems] = useState<Item[]>([])
  const [types, setTypes] = useState<ItemType[]>([])
  const [message, setMessage] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<ItemForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<ItemForm>(EMPTY_FORM)

  const load = async () => {
    const [fetchedItems, fetchedTypes] = await Promise.all([fetchItems(), fetchTypes()])
    setItems(fetchedItems)
    setTypes(fetchedTypes)
  }

  useEffect(() => { load() }, [])

  const flash = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 4000)
  }

  const resolveImagePath = (path: string | null) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${API_BASE}${path}`
  }

  const formToPayload = (f: ItemForm) => ({
    Name: f.name.trim(),
    Description: f.description.trim(),
    ImagePath: f.imagePath.trim(),
    Price: Number(f.price),
    Type_id: Number(f.type_id),
    ValidityDays: Number(f.validityDays),
  })

  const validate = (f: ItemForm) => {
    if (!f.name.trim()) return "Name is required."
    if (!f.type_id) return "Type is required."
    if (!f.price || isNaN(Number(f.price)) || Number(f.price) < 0) return "Valid price is required."
    if (!f.validityDays || isNaN(Number(f.validityDays)) || Number(f.validityDays) < 1) return "Validity days must be ≥ 1."
    return null
  }

  const handleCreate = async () => {
    const err = validate(createForm)
    if (err) { flash(err); return }
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/items`, {
        method: "POST",
        body: JSON.stringify(formToPayload(createForm)),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Item created.")
      setCreateForm(EMPTY_FORM)
      setShowCreate(false)
      load()
    } catch { flash("Failed to create item.") }
  }

  const startEdit = (item: Item) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name ?? "",
      description: item.description ?? "",
      imagePath: resolveImagePath(item.imagePath),
      price: String(item.price),
      type_id: String(item.type_id),
      validityDays: String(item.validityDays),
    })
  }

  const handleUpdate = async (id: number) => {
    const err = validate(editForm)
    if (err) { flash(err); return }
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(formToPayload(editForm)),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Item updated.")
      setEditingId(null)
      load()
    } catch { flash("Failed to update item.") }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm("Deactivate this item?")) return
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/items/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`${res.status}`)
      flash("Item deactivated.")
      load()
    } catch { flash("Failed to deactivate item.") }
  }

  const FormFields = ({
    form, setForm,
  }: { form: ItemForm; setForm: React.Dispatch<React.SetStateAction<ItemForm>> }) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Daily pass" />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description" />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Cover Image</Label>
        <ImageUpload
          value={form.imagePath}
          onChange={(url) => setForm((f) => ({ ...f, imagePath: url }))}
        />
      </div>
      <div className="space-y-1">
        <Label>Price (HUF)</Label>
        <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="2500" />
      </div>
      <div className="space-y-1">
        <Label>Validity (days)</Label>
        <Input type="number" min={1} value={form.validityDays} onChange={(e) => setForm((f) => ({ ...f, validityDays: e.target.value }))} placeholder="30" />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Type</Label>
        <Select value={form.type_id} onValueChange={(v) => setForm((f) => ({ ...f, type_id: v }))}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {types.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>{t.type}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Manage Items</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create, edit and deactivate ticket passes.</p>
          </div>
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
            {showCreate ? "Cancel" : "New Item"}
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6 space-y-3 rounded-lg border border-border p-4">
            <h4 className="font-medium">New Item</h4>
            <FormFields form={createForm} setForm={setCreateForm} />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        )}

        <div className="space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground">No items found.</p>}
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <FormFields form={editForm} setForm={setEditForm} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(item.id)}><Check className="size-3.5" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="size-3.5" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {item.imagePath && (
                      <img
                        src={resolveImagePath(item.imagePath)}
                        alt={item.name ?? ""}
                        className="h-14 w-20 shrink-0 rounded object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{item.name}</p>
                        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary capitalize">{item.typeName}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.price} HUF · {item.validityDays} day{item.validityDays !== 1 ? "s" : ""}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="icon-sm" variant="outline" onClick={() => startEdit(item)}><Pencil className="size-3.5" /></Button>
                    <Button size="icon-sm" variant="destructive" onClick={() => handleDeactivate(item.id)}><PackageX className="size-3.5" /></Button>
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
