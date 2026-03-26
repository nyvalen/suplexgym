import { Button } from "../../button"
import { Card } from "../../card"
import { Input } from "../../input"
import { Label } from "../../label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select"
import { Textarea } from "../../textarea"
function getUserRole() {
  return fetch("http://localhost:5103/api/admin/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("User Role:", data.role)
      console.log(data)
    })
    .catch((error) => {
      console.error("Error fetching user role:", error)
      return null
    })
}
getUserRole()

export default function CrudsUpdateUser() {
  return (
    <section className="grid min-h-screen place-items-center py-16">
      <Card className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Update user</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Update user information, and roles.
          </p>
        </div>
        <form action="#" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              type="text"
              placeholder="e.g. Slim Fit Denim Jacket"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Designer Brand</Label>
            <Input
              id="brand"
              name="brand"
              type="text"
              placeholder="e.g. Balenciaga"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Retail Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="e.g. 199"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category">
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outerwear">Outerwear</SelectItem>
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Bottoms</SelectItem>
                <SelectItem value="footwear">Footwear</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Product Details</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Material, fit, washing instructions..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="destructive" className="flex-1">
              Remove Item
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
