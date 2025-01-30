"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { addProduct } from "@/app/actions"
import { addStoredProduct } from "@/lib/data"

export default function AddProductForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await addProduct(formData)

      if (result.success && result.product) {
        // Add to local storage
        addStoredProduct(result.product)
        
        toast({
          title: "Success",
          description: "Product added successfully!",
        })
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add product",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select name="unit" required>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="grams">Grams</SelectItem>
                <SelectItem value="kilograms">Kilograms</SelectItem>
                <SelectItem value="liters">Liters</SelectItem>
                <SelectItem value="milliliters">Milliliters</SelectItem>
                <SelectItem value="cups">Cups</SelectItem>
                <SelectItem value="tablespoons">Tablespoons</SelectItem>
                <SelectItem value="teaspoons">Teaspoons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              name="expirationDate"
              type="date"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
